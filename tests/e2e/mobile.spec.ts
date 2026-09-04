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
