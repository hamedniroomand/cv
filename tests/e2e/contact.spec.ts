import { expect, test } from '@playwright/test'

test.describe('contact form', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only')

  test('sends once the turnstile widget has issued a token', async ({ page, request }) => {
    await page.goto('/')
    const input = page.getByLabel('Terminal input')
    await input.fill('contact')
    await input.press('Enter')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('name:').fill('Ada')
    await dialog.getByLabel('email:').fill('ada@example.com')
    await dialog.getByLabel('message:').fill('Hello there, this is long enough to send.')

    const send = dialog.getByRole('button', { name: 'Send message' })
    await expect(send).toBeDisabled()
    await expect(send).toBeEnabled({ timeout: 15_000 })
    await send.click()
    await expect(dialog.getByRole('status')).toContainText('Sent.')

    const delivered = await (await request.get('http://localhost:3458/messages')).json()
    expect(JSON.stringify(delivered)).toContain('ada@example.com')
  })

  test('shows a validation error under every invalid field and does not send', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('Terminal input')
    await input.fill('contact')
    await input.press('Enter')

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('name:').fill(' ')
    await dialog.getByLabel('email:').fill('asd')
    await dialog.getByLabel('message:').fill('hi')
    const send = dialog.getByRole('button', { name: 'Send message' })
    await expect(send).toBeEnabled({ timeout: 15_000 })
    await send.click()

    await expect(dialog.getByText('name is required')).toBeVisible()
    await expect(dialog.getByText('email must be valid')).toBeVisible()
    await expect(dialog.getByText('message must be at least 10 characters')).toBeVisible()
    await expect(dialog.getByLabel('email:')).toHaveAttribute('aria-invalid', 'true')
    await expect(dialog.getByRole('status')).toHaveCount(0)
  })

  test('the turnstile widget is as wide as the message field', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('Terminal input')
    await input.fill('contact')
    await input.press('Enter')
    const dialog = page.getByRole('dialog')
    const widget = dialog.locator('.turnstile')
    await expect(widget).toBeVisible()
    const [w, t] = await Promise.all([widget.boundingBox(), dialog.getByLabel('message:').boundingBox()])
    expect(w!.x).toBeCloseTo(t!.x, 0)
    expect(w!.width).toBeCloseTo(t!.width, 0)
  })
})
