import { expect, test } from '@playwright/test'

async function run(page: import('@playwright/test').Page, command: string): Promise<void> {
  const terminalTab = page.getByRole('tab', { name: 'Terminal' })
  if (await terminalTab.isVisible())
    await terminalTab.click()
  const input = page.getByLabel('Terminal input')
  await input.fill(command)
  await input.press('Enter')
}

test.describe('themes', () => {
  test('switches theme, reports the current value, and persists it', async ({ page }) => {
    await page.goto('/')
    await run(page, 'theme light')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await run(page, 'theme')
    await expect(page.getByRole('log')).toContainText('* light')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('CRT theme renders its restrained scanline layer', async ({ page }) => {
    await page.goto('/')
    await run(page, 'theme crt')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'crt')
    const content = await page.evaluate(() => getComputedStyle(document.body, '::after').content)
    expect(content).not.toBe('none')
  })

  test('CRT effects are removed when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await run(page, 'theme crt')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'crt')
    const content = await page.evaluate(() => getComputedStyle(document.body, '::after').content)
    expect(content).toBe('none')
  })
})
