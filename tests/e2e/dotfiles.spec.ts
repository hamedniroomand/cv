import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { runCommand } from './helpers';

const URL = '/dotfiles/vscode-settings';

const cardStatus = (page: Page) =>
  page.getByRole('region', { name: 'VS Code settings file' }).getByRole('status');

test.describe('dotfile page', () => {
  test('is server-rendered with title, description, highlighted code and a gist link', async ({
    request,
  }) => {
    const res = await request.get(URL);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('<title>VS Code settings — Hamed Niroomand</title>');
    expect(html).toContain('id="dotfile-vscode-settings"');
    expect(html).toContain('class="shj shj-lang-jsonc shj-multiline"');
    expect(html).toContain('class="shj-cmnt"');
    expect(html).not.toMatch(/class="shj[^"]*"[^>]*style=/);
    expect(html).toContain(
      'https://gist.github.com/hamedniroomand/dc74c846d1e701c65779fdaf7d58e1bf',
    );
    expect(html).toContain(`<link rel="canonical" href="http://localhost:3457${URL}">`);
  });

  test('unknown slugs 404 with the terminal-style error', async ({ request }) => {
    const res = await request.get('/dotfiles/nope');
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('open /dotfiles/nope');
  });

  test('shows the file path tab and the language', async ({ page }) => {
    await page.goto(URL);
    const card = page.getByRole('region', { name: 'VS Code settings file' });
    await expect(card).toContainText('~/.config/Code/User/settings.json');
    await expect(card).toContainText('jsonc');
    await expect(card.locator('.shj-numbers div').first()).toHaveText('1');
  });

  test('tokens are colored by the theme', async ({ page }) => {
    await page.goto(URL);
    const comment = page.locator('.shj-cmnt').first();
    const body = page.locator('body');
    const [tokenColor, bodyColor] = await Promise.all([
      comment.evaluate(el => getComputedStyle(el).color),
      body.evaluate(el => getComputedStyle(el).color),
    ]);
    expect(tokenColor).not.toBe(bodyColor);
    expect(await comment.evaluate(el => getComputedStyle(el).fontStyle)).toBe('italic');
  });
});

test.describe('dotfile page actions', () => {
  test.skip(({ isMobile }) => isMobile, 'clipboard is exercised on desktop');

  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  });

  test('Copy puts the raw file on the clipboard and confirms', async ({ page }) => {
    await page.goto(URL);
    await page.getByRole('button', { name: 'Copy file' }).click();
    await expect(cardStatus(page)).toContainText('Copied');
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text.trimStart().startsWith('{')).toBe(true);
    expect(text).toContain('editor.fontFamily');
  });

  test('Share copies the page url', async ({ page }) => {
    await page.goto(URL);
    await page.getByRole('button', { name: 'Share link' }).click();
    await expect(cardStatus(page)).toContainText('Link copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      `http://localhost:3457${URL}`,
    );
  });

  test('booting the terminal on a dotfile page stays on that page', async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole('log')).toContainText('Hamed Niroomand');
    await expect(page).toHaveURL(/\/dotfiles\/vscode-settings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'VS Code settings' })).toBeVisible();
  });

  test('the terminal starts in the file directory', async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByLabel('Terminal input')).toBeVisible();
    await expect(page.locator('.terminal')).toContainText('~/.config/Code/User$');
    await runCommand(page, 'cat settings.json');
    await expect(page.getByRole('log')).toContainText('editor.fontFamily');
  });
});

test.describe('dotfiles index', () => {
  test('lists entries and links to them', async ({ page, request }) => {
    const html = await (await request.get('/dotfiles')).text();
    expect(html).toContain('<title>Dotfiles — Hamed Niroomand</title>');
    expect(html).toContain('id="section-dotfiles"');

    await page.goto('/dotfiles');
    const link = page.getByRole('link', { name: 'VS Code settings' });
    await expect(link).toBeVisible();
    await expect(page.getByText('~/.config/Code/User/settings.json')).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/dotfiles\/vscode-settings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'VS Code settings' })).toBeVisible();
  });
});

test.describe('terminal navigation between pages', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('cat on a dotfile from the home page opens its page and keeps terminal history', async ({
    page,
  }) => {
    await page.goto('/');
    await runCommand(page, 'echo before-navigation');
    await runCommand(page, 'cat ~/.config/Code/User/settings.json');
    await expect(page).toHaveURL(/\/dotfiles\/vscode-settings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'VS Code settings' })).toBeVisible();
    await expect(page.getByRole('log')).toContainText('before-navigation');
    await expect(page.getByRole('log')).toContainText('editor.fontFamily');
  });

  test('cat about.md from a dotfile page returns to the resume', async ({ page }) => {
    await page.goto('/dotfiles/vscode-settings');
    await runCommand(page, 'cat ~/about.md');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#section-about')).toBeInViewport();
    await expect(page.getByRole('log')).toContainText('cat ~/about.md');
  });

  test('the dotfiles command opens the index', async ({ page }) => {
    await page.goto('/');
    await runCommand(page, 'dotfiles');
    await expect(page).toHaveURL(/\/dotfiles$/);
    await expect(page.getByRole('link', { name: 'VS Code settings' })).toBeVisible();
  });

  test('the mobile tab is labelled File on dotfile pages', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 400, height: 800 } });
    const page = await context.newPage();
    await page.goto('/dotfiles/vscode-settings');
    await expect(page.getByRole('tab', { name: 'File' })).toBeVisible();
    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Resume' })).toBeVisible();
    await context.close();
  });
});
