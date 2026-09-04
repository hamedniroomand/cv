import { expect, test } from '@playwright/test'

test.describe('desktop terminal', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only')

  test('boot then whoami shows key facts while the panel is server-rendered', async ({ page }) => {
    const response = await page.goto('/')
    const html = await response!.text()
    expect(html).toContain('Jack Westin')
    expect(html).toMatch(/<h1[^>]*>Hamed Niroomand<\/h1>/)

    const log = page.getByRole('log')
    await expect(log).toContainText('Hamed Niroomand', { timeout: 5000 })
    await expect(log).toContainText('Frontend Team Lead')
    await expect(log).toContainText('Type \'help\'')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hamed Niroomand')
  })

  test('cd scrolls and highlights the matching panel entry', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('Terminal input')
    await input.fill('cd experience/thales')
    await input.press('Enter')
    await expect(page.locator('#exp-thales')).toHaveClass(/is-highlighted/)
    await expect(page.locator('#exp-thales')).toBeInViewport()
    await expect(page.getByLabel('Terminal input').locator('..')).toContainText('~/experience/thales$')
  })

  test('sudo is required for .secrets', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('Terminal input')
    await input.fill('cat ~/.secrets')
    await input.press('Enter')
    await expect(page.getByRole('log')).toContainText('cat: ~/.secrets: Permission denied')
    await input.fill('sudo cat ~/.secrets | head -n 1')
    await input.press('Enter')
    await expect(page.getByRole('log')).toContainText('vim')
  })

  test('tab completes paths', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('Terminal input')
    await input.fill('cat ab')
    await input.press('Tab')
    await expect(input).toHaveValue('cat about.md ')
  })
})
