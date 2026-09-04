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
})
