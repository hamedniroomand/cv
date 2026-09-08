import { expect, test } from '@playwright/test';

test('work history shows two recent roles and lets visitors expand earlier work', async ({
  page,
}) => {
  await page.goto('/');
  const section = page.locator('#experience');
  await expect(section.locator('.work-row:visible')).toHaveCount(2);
  const toggle = section.getByText('Earlier work', { exact: false });
  await toggle.click();
  await expect(section.locator('.work-row:visible')).toHaveCount(5);
  await expect(section.getByRole('heading', { name: 'Xaankoo' })).toBeVisible();
  await toggle.click();
  await expect(section.locator('.work-row:visible')).toHaveCount(2);
});

test('section reveals respect reduced motion and never hide the content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.locator('#experience');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible();
  expect(await section.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await section.evaluate(el => getComputedStyle(el).opacity)).toBe('1');
});
