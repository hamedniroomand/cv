import { expect, test } from '@playwright/test'

test.describe('panel', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only')

  test('deep link is server-rendered and scrolls to the entry', async ({ page, request }) => {
    const html = await (await request.get('/experience/jack-westin')).text()
    expect(html).toContain('<title>Jack Westin — Hamed Niroomand</title>')
    expect(html).toContain('id="exp-jack-westin"')

    await page.goto('/experience/thales')
    await expect(page.locator('#exp-thales')).toBeInViewport()
  })

  test('unknown experience is a 404', async ({ request }) => {
    expect((await request.get('/experience/nope')).status()).toBe(404)
  })

  test('clicking a path label runs it in the terminal', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByLabel('Terminal input')).toBeVisible()
    await page.getByRole('button', { name: '~/about.md' }).click()
    await expect(page.getByRole('log')).toContainText('bat ~/about.md')
    await expect(page.getByRole('log')).toContainText('senior web developer based in Yerevan')
  })
})
