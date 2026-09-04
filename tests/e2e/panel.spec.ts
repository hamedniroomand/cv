import { expect, test } from '@playwright/test'

test.describe('panel', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only')

  test('the resume is server-rendered with every experience entry', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expect(html).toContain('<title>Hamed Niroomand — ')
    expect(html).toContain('id="exp-jack-westin"')
    expect(html).toContain('id="exp-thales"')
  })

  test('experience pages no longer exist', async ({ request }) => {
    expect((await request.get('/experience/thales')).status()).toBe(404)
  })

  test('clicking a path label runs it in the terminal', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByLabel('Terminal input')).toBeVisible()
    await page.getByRole('button', { name: '~/about.md' }).click()
    await expect(page.getByRole('log')).toContainText('bat ~/about.md')
    await expect(page.getByRole('log')).toContainText('senior web developer based in Yerevan')
  })
})
