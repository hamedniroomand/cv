import { expect, test } from '@playwright/test';

test.describe('pdf', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('cv --pdf downloads the resume', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');
    const download = page.waitForEvent('download');
    await input.fill('cv --pdf');
    await input.press('Enter');
    expect((await download).suggestedFilename()).toBe('hamed-niroomand-cv.pdf');
    await expect(page.getByRole('log')).toContainText('Downloading hamed-niroomand-cv.pdf');
  });

  test('panel button serves the PDF as an attachment', async ({ page, request }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Download PDF' });
    await expect(link).toHaveAttribute('download', 'hamed-niroomand-cv.pdf');
    const res = await request.get('/hamed-niroomand-cv.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
    expect(res.headers()['content-disposition']).toContain('attachment');
  });
});
