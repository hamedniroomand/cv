import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const DISCORD_MOCK_URL = 'http://localhost:3458';

export async function openTerminal(page: Page): Promise<Locator> {
  const terminalTab = page.getByRole('tab', { name: 'Terminal' });
  if (await terminalTab.isVisible()) await terminalTab.click();
  const input = page.getByLabel('Terminal input');
  await expect(input).toBeVisible({ timeout: 5000 });
  return input;
}

export async function runCommand(page: Page, command: string): Promise<void> {
  const input = await openTerminal(page);
  await input.fill(command);
  await input.press('Enter');
}

export async function openApp(page: Page): Promise<Locator> {
  await page.goto('/');
  await runCommand(page, 'hamed');
  await expect(page.getByRole('heading', { name: /hamed 1\.0/i })).toBeVisible();
  return page.getByRole('combobox', { name: 'App command' });
}

export async function reloadWithoutHydration(page: Page): Promise<void> {
  await page.route(/\/_nuxt\/.*\.js/, route => route.abort());
  await page.reload();
}
