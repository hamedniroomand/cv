import { expect, test } from '@playwright/test';

test.describe('panel', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('the resume is server-rendered with every experience entry', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('<title>Hamed Niroomand — ');
    expect(html).toContain('id="exp-jack-westin"');
    expect(html).toContain('id="exp-thales"');
  });

  test('the home page publishes Open Graph and Twitter card tags with an image', async ({
    request,
  }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('<meta property="og:title" content="Hamed Niroomand — ');
    expect(html).toContain('<meta property="og:description" content="');
    expect(html).toContain('<meta property="og:image" content="http://localhost:3457/og.png">');
    expect(html).toContain(
      '<meta property="og:image:secure_url" content="http://localhost:3457/og.png">',
    );
    expect(html).toContain('<meta property="og:image:type" content="image/png">');
    expect(html).toContain('<meta property="og:image:width" content="1200">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('<meta name="twitter:image" content="http://localhost:3457/og.png">');
    const image = await request.get('/og.png');
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toContain('image/png');
  });

  test('experience pages no longer exist and the 404 prompt names the real host', async ({
    request,
  }) => {
    const res = await request.get('/experience/thales');
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('hamed@localhost:~$ open /experience/thales');
  });

  test('clicking a path label runs it in the terminal', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Terminal input')).toBeVisible();
    await page.getByRole('button', { name: '~/about.md' }).click();
    await expect(page.getByRole('log')).toContainText('bat ~/about.md');
    await expect(page.getByRole('log')).toContainText('senior web developer based in Yerevan');
  });

  test('the header links to the site source on GitHub', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Source on GitHub' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://github.com/hamedniroomand/cv');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link.locator('svg')).toHaveCount(1);
  });
});
