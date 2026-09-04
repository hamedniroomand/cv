import type { Locator, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openApp(page: Page): Promise<Locator> {
  await page.goto('/')
  const shellInput = page.getByLabel('Terminal input')
  await expect(shellInput).toBeVisible({ timeout: 5000 })
  await shellInput.fill('hamed')
  await shellInput.press('Enter')
  await expect(page.getByRole('heading', { name: /hamed 1\.0/i })).toBeVisible()
  return page.getByRole('combobox', { name: 'App command' })
}

test.describe('desktop interactive app', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only')

  test('opens, filters commands, picks experience, runs shell, and restores scrollback', async ({ page }) => {
    const prompt = await openApp(page)

    await prompt.fill('/exp')
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toContainText('/experience')
    await prompt.press('Enter')
    await page.getByRole('option', { name: /Thales MFI GmbH/ }).click()
    await expect(page.locator('#exp-thales')).toHaveClass(/is-highlighted/)

    await prompt.fill('ls')
    await prompt.press('Enter')
    await expect(page.getByRole('log', { name: 'App output' })).toContainText('about.md')

    await prompt.press('Escape')
    await expect(page.getByLabel('Terminal input')).toBeFocused()
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('Hamed Niroomand')
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('hamed: exited')
  })

  test('slash opens every command and options support pointer selection', async ({ page }) => {
    const prompt = await openApp(page)
    await prompt.fill('/')

    const menu = page.getByRole('listbox', { name: 'Slash commands' })
    await expect(menu).toHaveAttribute('id', 'tui-slash-listbox')
    await expect(menu.getByRole('option')).toHaveCount(12)
    await expect(menu.locator('.slash-menu__name')).toHaveText([
      '/about',
      '/api',
      '/clear',
      '/contact',
      '/education',
      '/exit',
      '/experience',
      '/help',
      '/pdf',
      '/projects',
      '/skills',
      '/theme',
    ])
    await expect(prompt).toHaveAttribute('id', 'tui-app-prompt')
    await expect(prompt).toHaveAttribute('aria-controls', 'tui-slash-listbox')
    await expect(prompt).toHaveAttribute('aria-expanded', 'true')

    const help = page.getByRole('option', { name: /^\/help\b/ })
    await expect(help).toHaveAttribute('id', 'tui-slash-option-help')
    await help.click()
    await expect(page.getByRole('log', { name: 'App output' })).toContainText('Plain text runs as a shell command.')
  })

  test('menu arrows wrap and Tab completes the highlighted command', async ({ page }) => {
    const prompt = await openApp(page)
    await prompt.fill('/')

    await expect(prompt).toHaveAttribute('aria-activedescendant', 'tui-slash-option-about')
    await prompt.press('ArrowUp')
    await expect(prompt).toHaveAttribute('aria-activedescendant', 'tui-slash-option-theme')
    await prompt.press('ArrowDown')
    await expect(prompt).toHaveAttribute('aria-activedescendant', 'tui-slash-option-about')

    await prompt.fill('/exp')
    await prompt.press('Tab')
    await expect(prompt).toHaveValue('/experience ')
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toContainText('Thales MFI GmbH')
  })

  test('menu Escape closes suggestions without changing prompt text', async ({ page }) => {
    const prompt = await openApp(page)
    await prompt.fill('/exp')
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toBeVisible()

    await prompt.press('Escape')
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toBeHidden()
    await expect(prompt).toHaveValue('/exp')
  })

  test('Enter submits unknown commands and invalid arguments when the menu has no matches', async ({ page }) => {
    const prompt = await openApp(page)
    const output = page.getByRole('log', { name: 'App output' })

    await prompt.fill('/unknown')
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toContainText('No matches')
    await prompt.press('Enter')
    await expect(output).toContainText('hamed: unknown command /unknown — type / to see the list')

    await prompt.fill('/experience invalid')
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toContainText('No matches')
    await prompt.press('Enter')
    await expect(output).toContainText('experience: unknown company \'invalid\'')
  })

  test('picker filters, wraps, selects, and exposes stable option ids', async ({ page }) => {
    const prompt = await openApp(page)
    await prompt.fill('/experience')
    await prompt.press('Enter')

    const picker = page.getByRole('listbox', { name: 'Choose a company' })
    await expect(picker).toBeFocused()
    await expect(picker).toHaveAttribute('id', 'tui-picker-listbox')
    await picker.press('t')
    await picker.press('h')
    await expect(page.getByRole('option')).toHaveCount(1)
    const thales = page.getByRole('option', { name: /Thales MFI GmbH/ })
    await expect(thales).toHaveAttribute('id', /^tui-picker-option-\d+$/)
    const thalesId = await thales.getAttribute('id')
    await picker.press('ArrowUp')
    await expect(picker).toHaveAttribute('aria-activedescendant', thalesId!)
    await picker.press('Enter')
    await expect(page.locator('#exp-thales')).toHaveClass(/is-highlighted/)
  })

  test('arrow navigation keeps overflowing menu and picker selections visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 320 })
    const prompt = await openApp(page)
    await prompt.fill('/')

    const menu = page.getByRole('listbox', { name: 'Slash commands' })
    expect(await menu.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
    await prompt.press('ArrowUp')
    const activeMenuId = await prompt.getAttribute('aria-activedescendant')
    expect(await menu.evaluate((element, activeId) => {
      const active = document.getElementById(activeId ?? '')
      if (!active)
        return false
      const listRect = element.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      return activeRect.top >= listRect.top && activeRect.bottom <= listRect.bottom
    }, activeMenuId)).toBe(true)
    await prompt.press('Enter')

    const picker = page.getByRole('listbox', { name: 'Choose a theme' })
    expect(await picker.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
    await picker.press('ArrowUp')
    expect(await picker.evaluate((element) => {
      const active = document.getElementById(element.getAttribute('aria-activedescendant') ?? '')
      if (!active)
        return false
      const listRect = element.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      return activeRect.top >= listRect.top && activeRect.bottom <= listRect.bottom
    })).toBe(true)
  })

  test('Escape and Ctrl+C cancel a picker and restore prompt focus', async ({ page }) => {
    const prompt = await openApp(page)
    await prompt.fill('/experience')
    await prompt.press('Enter')
    const picker = page.getByRole('listbox', { name: 'Choose a company' })

    await picker.press('Escape')
    await expect(picker).toBeHidden()
    await expect(prompt).toBeFocused()

    await prompt.fill('/experience')
    await prompt.press('Enter')
    await page.getByRole('listbox', { name: 'Choose a company' }).press('Control+c')
    await expect(page.getByRole('listbox', { name: 'Choose a company' })).toBeHidden()
    await expect(prompt).toBeFocused()
  })

  test('Ctrl+L clears app output from the prompt, picker, and another app control', async ({ page }) => {
    const prompt = await openApp(page)
    const output = page.getByRole('log', { name: 'App output' })
    await prompt.fill('ls')
    await prompt.press('Enter')
    await expect(output).toContainText('about.md')

    await prompt.press('Control+l')
    await expect(output).toBeEmpty()

    await prompt.fill('ls')
    await prompt.press('Enter')
    await expect(output).toContainText('about.md')
    await prompt.fill('/experience')
    await prompt.press('Enter')
    const picker = page.getByRole('listbox', { name: 'Choose a company' })
    await picker.press('Control+l')
    await expect(output).toBeEmpty()
    await expect(picker).toBeVisible()
    await picker.press('Control+c')

    await prompt.fill('ls')
    await prompt.press('Enter')
    await expect(output).toContainText('about.md')
    const exit = page.getByRole('button', { name: 'Exit interactive app' })
    await exit.focus()
    await exit.press('Control+l')
    await expect(output).toBeEmpty()

    await prompt.focus()
    await prompt.press('Escape')
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('Hamed Niroomand')
  })

  test('Ctrl+C aborts a delayed same-origin curl and the app accepts the next command', async ({ page }) => {
    await page.route('**/api/cv?slow=tui-abort', (route) => {
      setTimeout(() => {
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{"late":true}',
        }).catch(() => {})
      }, 5000)
    })

    const prompt = await openApp(page)
    const requestStarted = page.waitForRequest(request => request.url().includes('/api/cv?slow=tui-abort'))
    const requestFailed = page.waitForEvent('requestfailed', {
      predicate: request => request.url().includes('/api/cv?slow=tui-abort'),
    })

    await prompt.fill('curl -s /api/cv?slow=tui-abort')
    await prompt.press('Enter')
    await requestStarted
    await prompt.press('Control+c')
    await requestFailed
    await expect(prompt).toHaveAttribute('aria-busy', 'false')

    await prompt.fill('echo recovered')
    await prompt.press('Enter')
    await expect(page.getByRole('log', { name: 'App output' })).toContainText('recovered')
  })

  test('app history is local and restores the draft after arrow navigation', async ({ page }) => {
    const prompt = await openApp(page)
    const output = page.getByRole('log', { name: 'App output' })
    await prompt.fill('pwd')
    await prompt.press('Enter')
    await expect(output).toContainText('/home/hamed')
    await prompt.fill('ls')
    await prompt.press('Enter')
    await expect(output).toContainText('about.md')

    await prompt.fill('draft')
    await prompt.press('ArrowUp')
    await expect(prompt).toHaveValue('ls')
    await prompt.press('ArrowUp')
    await expect(prompt).toHaveValue('pwd')
    await prompt.press('ArrowDown')
    await expect(prompt).toHaveValue('ls')
    await prompt.press('ArrowDown')
    await expect(prompt).toHaveValue('draft')
  })

  test('a slash outside column zero falls through to shell parsing', async ({ page }) => {
    const prompt = await openApp(page)
    await prompt.fill('echo /experience')
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toBeHidden()
    await prompt.press('Enter')
    await expect(page.getByRole('log', { name: 'App output' })).toContainText('/experience')
  })

  test('empty Escape and Ctrl+D exit the app', async ({ page }) => {
    let prompt = await openApp(page)
    await prompt.press('Escape')
    await expect(page.getByLabel('Terminal input')).toBeFocused()

    prompt = await openApp(page)
    await prompt.press('Control+d')
    await expect(page.getByLabel('Terminal input')).toBeFocused()
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('hamed: exited')
  })
})
