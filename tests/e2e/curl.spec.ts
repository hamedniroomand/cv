import { expect, test } from '@playwright/test'

test.describe('curl', () => {
  test.skip(({ isMobile }) => isMobile, 'runs once')

  test('fetches the live api and pipes into jq', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('Terminal input')
    await input.fill('curl -s /api/cv | jq .profile.name')
    await input.press('Enter')
    await expect(page.getByRole('log')).toContainText('"Hamed Niroomand"', { timeout: 5000 })
  })

  test('refuses external urls', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('Terminal input')
    await input.fill('curl https://example.com')
    await input.press('Enter')
    await expect(page.getByRole('log')).toContainText('Only', { timeout: 5000 })
    await expect(page.getByRole('log')).toContainText('/api/*')
  })
})
