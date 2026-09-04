import { expect, test } from '@playwright/test'

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only')

  test('resume is the default view; terminal loads on tab switch', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#resume')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hamed Niroomand')
    await expect(page.getByLabel('Terminal input')).toHaveCount(0)

    await page.getByRole('tab', { name: 'Terminal' }).click()
    await expect(page.locator('#resume')).toBeHidden()
    await expect(page.getByRole('log')).toContainText('Hamed Niroomand', { timeout: 5000 })
    await expect(page.getByLabel('Terminal input')).toBeVisible()

    await page.getByRole('tab', { name: 'Resume' }).click()
    await expect(page.locator('#resume')).toBeVisible()
  })

  test('focused terminal input stays visible when the visual viewport shrinks', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(() => {
      let height = window.innerHeight
      const viewport = new EventTarget()
      Object.defineProperty(viewport, 'height', { get: () => height })
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: viewport,
      })
      Object.defineProperty(window, '__setVisualViewportHeight', {
        value: (nextHeight: number) => {
          height = nextHeight
          viewport.dispatchEvent(new Event('resize'))
        },
      })
    })
    await page.goto('/')
    await page.getByRole('tab', { name: 'Terminal' }).click()

    const input = page.getByLabel('Terminal input')
    await expect(input).toBeVisible()
    await input.fill('help')
    await input.press('Enter')
    await expect(page.getByRole('log')).toContainText('Tab completes, ↑/↓ recall history')
    await input.focus()

    await page.evaluate(() => {
      (window as typeof window & { __setVisualViewportHeight: (height: number) => void })
        .__setVisualViewportHeight(500)
    })

    await expect.poll(async () => page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>('[aria-label="Terminal input"]')
      const terminal = document.querySelector<HTMLElement>('.terminal')
      const viewportBottom = window.visualViewport?.height ?? window.innerHeight
      if (!input || !terminal)
        return false
      return document.activeElement === input
        && input.getBoundingClientRect().bottom <= viewportBottom
        && terminal.getBoundingClientRect().bottom <= viewportBottom
        && terminal.scrollTop + terminal.clientHeight >= terminal.scrollHeight - 1
    })).toBe(true)
  })
})

test.describe('mobile shortcuts', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only')

  test('inputs are 16px so iOS Safari does not zoom on focus', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Terminal' }).click()
    const input = page.getByLabel('Terminal input')
    await expect(input).toBeVisible()
    const size = await input.evaluate(el => Number.parseFloat(getComputedStyle(el).fontSize))
    expect(size).toBeGreaterThanOrEqual(16)
  })

  test('key row completes, runs, recalls history and interrupts', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Terminal' }).click()
    const input = page.getByLabel('Terminal input')
    const keys = page.getByRole('toolbar', { name: 'Terminal shortcuts' })
    await expect(keys).toBeVisible()

    await input.fill('cat ab')
    await keys.getByRole('button', { name: 'Complete' }).click()
    await expect(input).toHaveValue('cat about.md ')
    await keys.getByRole('button', { name: 'Run command' }).click()
    await expect(page.getByRole('log')).toContainText('based in Yerevan')
    await expect(input).toHaveValue('')

    await keys.getByRole('button', { name: 'Previous command' }).click()
    await expect(input).toHaveValue('cat about.md')
    await keys.getByRole('button', { name: 'Interrupt' }).click()
    await expect(input).toHaveValue('')
    await expect(page.getByRole('log')).toContainText('^C')

    await keys.getByRole('button', { name: 'Run help' }).click()
    await expect(page.getByRole('log')).toContainText('Tab completes')
    await keys.getByRole('button', { name: 'Clear screen' }).click()
    await expect(page.getByRole('log')).not.toContainText('Tab completes')
  })

  test('app key row opens the slash menu and exits', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Terminal' }).click()
    const input = page.getByLabel('Terminal input')
    await input.fill('hamed')
    await page.getByRole('toolbar', { name: 'Terminal shortcuts' }).getByRole('button', { name: 'Run command' }).click()

    const prompt = page.getByRole('combobox', { name: 'App command' })
    await expect(prompt).toBeVisible()
    const keys = page.getByRole('toolbar', { name: 'App shortcuts' })
    await keys.getByRole('button', { name: 'Show commands' }).click()
    await expect(prompt).toHaveValue('/')
    await expect(page.getByRole('listbox')).toBeVisible()
    await keys.getByRole('button', { name: 'Escape' }).click()
    await expect(page.getByRole('listbox')).toHaveCount(0)
    await prompt.fill('')
    await keys.getByRole('button', { name: 'Escape' }).click()
    await expect(page.getByLabel('Terminal input')).toBeVisible()
  })
})
