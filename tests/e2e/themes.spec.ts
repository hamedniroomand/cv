import { expect, test } from '@playwright/test'
import { runCommand } from './helpers'

test.describe('themes', () => {
  test('switches theme, reports the current value, and persists it', async ({ page }) => {
    await page.goto('/')
    await runCommand(page, 'theme light')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await runCommand(page, 'theme')
    await expect(page.getByRole('log')).toContainText('* light')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('CRT theme renders its restrained scanline layer', async ({ page }) => {
    await page.goto('/')
    await runCommand(page, 'theme crt')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'crt')
    const content = await page.evaluate(() => getComputedStyle(document.body, '::after').content)
    expect(content).not.toBe('none')
  })

  test('CRT effects are removed when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await runCommand(page, 'theme crt')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'crt')
    const content = await page.evaluate(() => getComputedStyle(document.body, '::after').content)
    expect(content).toBe('none')
  })
})
