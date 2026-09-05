import { expect, test } from '@playwright/test';

import { reloadWithoutHydration } from './helpers';

test.describe('split layout', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('Ctrl+` hides and restores the resume panel', async ({ page }) => {
    await page.goto('/');
    const resume = page.locator('#resume');
    await expect(resume).toBeVisible();
    await page.getByLabel('Terminal input').press('Control+`');
    await expect(resume).toBeHidden();
    await page.keyboard.press('Control+`');
    await expect(resume).toBeVisible();
  });

  test('divider is keyboard resizable', async ({ page }) => {
    await page.goto('/');
    const divider = page.getByRole('separator', { name: 'Resize terminal and resume' });
    const before = Number(await divider.getAttribute('aria-valuenow'));
    await divider.focus();
    await divider.press('ArrowRight');
    const after = Number(await divider.getAttribute('aria-valuenow'));
    expect(after).toBeGreaterThan(before);
  });
});

test.describe('split layout first paint', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('a saved ratio is applied before hydration', async ({ page }) => {
    await page.goto('/');
    const divider = page.getByRole('separator', { name: 'Resize terminal and resume' });
    await divider.focus();
    await divider.press('End');
    await expect(divider).toHaveAttribute('aria-valuenow', '80');

    await reloadWithoutHydration(page);
    const terminal = page.locator('#terminal');
    const split = page.locator('.split');
    const [terminalBox, splitBox] = await Promise.all([
      terminal.boundingBox(),
      split.boundingBox(),
    ]);
    expect(terminalBox!.width / splitBox!.width).toBeCloseTo(0.8, 1);
  });

  test('a closed panel stays closed before hydration', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Terminal input').press('Control+`');
    await expect(page.locator('#resume')).toBeHidden();

    await reloadWithoutHydration(page);
    await expect(page.locator('#resume')).toBeHidden();
    const [terminalBox, splitBox] = await Promise.all([
      page.locator('#terminal').boundingBox(),
      page.locator('.split').boundingBox(),
    ]);
    expect(terminalBox!.width).toBeCloseTo(splitBox!.width, 0);
  });
});
