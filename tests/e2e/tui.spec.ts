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
    await expect(menu).toContainText('/about')
    await expect(menu).toContainText('/experience')
    await expect(menu).toContainText('/projects')
    await expect(menu).toContainText('/skills')
    await expect(menu).toContainText('/theme')
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
    await expect(thales).toHaveAttribute('id', 'tui-picker-option-thales')
    await picker.press('ArrowUp')
    await expect(picker).toHaveAttribute('aria-activedescendant', 'tui-picker-option-thales')
    await picker.press('Enter')
    await expect(page.locator('#exp-thales')).toHaveClass(/is-highlighted/)
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

  test('Ctrl+L clears app output without touching shell scrollback', async ({ page }) => {
    const prompt = await openApp(page)
    const output = page.getByRole('log', { name: 'App output' })
    await prompt.fill('ls')
    await prompt.press('Enter')
    await expect(output).toContainText('about.md')

    await prompt.press('Control+l')
    await expect(output).toBeEmpty()

    await prompt.press('Escape')
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('Hamed Niroomand')
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
