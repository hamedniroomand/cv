import { expect, test } from '@playwright/test';

test('public home leads with projects and keeps the résumé off the default path', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Useful things');
  await expect(page.getByRole('heading', { name: 'Selected projects' })).toBeVisible();
  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('a[href="/cv"]')).toHaveCount(0);
  await expect(page.getByLabel('Terminal input')).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore Cue' }).click();
  await expect(page).toHaveURL(/\/projects\/cue$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cue.');
});

test('public terminal opens on demand and closes with focus restored', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open terminal', exact: true });
  await trigger.click();
  const input = page.getByLabel('Terminal input');
  await expect(input).toBeVisible();
  await expect(page.getByRole('log')).toContainText('projects');
  await expect(page.getByRole('log')).not.toContainText('Senior Web Developer');
  await input.fill('ls experience');
  await input.press('Enter');
  await expect(page.getByRole('log')).toContainText('jack-westin.md');
  await expect(page.getByRole('log')).not.toContainText('Team Lead');
  await page.getByRole('button', { name: 'Close terminal' }).click();
  await expect(input).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(input).toBeFocused();
});

test('public pages fit the viewport and connect to dotfiles', async ({ page }) => {
  for (const path of [
    '/',
    '/projects/cue',
    '/projects/waverune',
    '/projects/kitdev',
    '/dotfiles',
    '/dotfiles/vscode-settings',
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  }
});

test('CV is directly accessible with its own canonical and noindex', async ({ request }) => {
  const response = await request.get('/cv');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('id="exp-jack-westin"');
  expect(html).toContain('name="robots" content="noindex, follow"');
  expect(html).toContain('rel="canonical" href="http://localhost:3457/cv"');
});

test('the public terminal explores without moving the page', async ({ page }) => {
  await page.goto('/projects/cue');
  await page.getByRole('button', { name: 'Open terminal', exact: true }).click();
  const input = page.getByLabel('Terminal input');

  // None of these has a page of its own, so none of them moves the visitor.
  for (const command of ['cd ~', 'bat ~/experience/thales.md', 'ls ~/projects']) {
    await input.fill(command);
    await input.press('Enter');
  }
  await expect(page.getByRole('log')).toContainText('Thales MFI GmbH');
  await expect(page).toHaveURL(/\/projects\/cue$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cue.');
  await expect(page.locator('#public-terminal')).not.toHaveClass(/terminal-dock--minimized/);
});

test('work history is public on the home page but role titles are not', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#experience');
  await expect(section).toContainText('Jack Westin');
  await expect(section).toContainText('Thales MFI GmbH');
  await expect(section).toContainText('Xaankoo');
  await expect(page.locator('body')).not.toContainText('Team Lead');
  await expect(page.locator('body')).not.toContainText('Frontend Team Lead');
});

test('the project page leads with the product and keeps the repository secondary', async ({
  page,
}) => {
  await page.goto('/projects/kitdev');
  const actions = page.locator('.project-page__actions a');
  await expect(actions.first()).toHaveText(/Visit KitDev Space/);
  await expect(actions.first()).not.toHaveClass(/btn-ghost/);
  const repo = page.getByRole('link', { name: /View on GitHub/ });
  await expect(repo).toHaveClass(/btn-ghost/);
  await expect(repo).toHaveAttribute('href', 'https://github.com/hamedniroomand/kitdev-space');
});

test('the terminal window minimizes, maximizes and keeps its session', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open terminal', exact: true }).click();
  const input = page.getByLabel('Terminal input');
  await input.fill('ls projects');
  await input.press('Enter');
  await expect(page.getByRole('log')).toContainText('cue');

  const dock = page.locator('#public-terminal');
  // A phone has no room for a small window, so the terminal opens at full size there.
  await expect(dock).toHaveClass(isMobile ? /terminal-dock--maximized/ : /terminal-dock--normal/);
  if (isMobile) {
    await page.getByRole('button', { name: 'Restore terminal size' }).click();
    await expect(dock).toHaveClass(/terminal-dock--normal/);
  }

  await page.getByRole('button', { name: 'Maximize terminal' }).click();
  await expect(dock).toHaveClass(/terminal-dock--maximized/);
  await page.getByRole('button', { name: 'Restore terminal size' }).click();
  await expect(dock).toHaveClass(/terminal-dock--normal/);

  await page.getByRole('button', { name: 'Minimize terminal' }).click();
  await expect(dock).toHaveClass(/terminal-dock--minimized/);
  await expect(input).toBeHidden();

  // The window comes back at the size it had, and the shell session is still there.
  await page.getByRole('button', { name: 'Restore terminal', exact: true }).click();
  await expect(dock).toHaveClass(/terminal-dock--normal/);
  await expect(input).toBeVisible();
  await expect(page.getByRole('log')).toContainText('cue');
});

test('the terminal minimizes when a command opens another page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open terminal', exact: true }).click();
  const dock = page.locator('#public-terminal');
  await expect(dock).not.toHaveClass(/terminal-dock--minimized/);

  const input = page.getByLabel('Terminal input');
  await input.fill('cat ~/.vscode/extensions.txt');
  await input.press('Enter');

  await expect(page).toHaveURL(/\/dotfiles\/vscode-extensions$/);
  await expect(dock).toHaveClass(/terminal-dock--minimized/);

  // The session is still there when the window comes back.
  await page.getByRole('button', { name: 'Restore terminal', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('vue.volar');
});

test('a command for the page already open leaves the terminal alone', async ({ page }) => {
  await page.goto('/projects/cue');
  const dock = page.locator('#public-terminal');

  // The path button runs `bat ~/projects/cue/README.md`, whose page is this one.
  await page.getByRole('button', { name: /~\/projects\/cue/ }).click();
  await expect(page.getByRole('log')).toContainText('Cue');
  await expect(page).toHaveURL(/\/projects\/cue$/);
  await expect(dock).not.toHaveClass(/terminal-dock--minimized/);

  // A command whose page is a different one still steps out of the way.
  const input = page.getByLabel('Terminal input');
  await input.fill('cat ~/.config/Code/User/settings.json');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/dotfiles\/vscode-settings$/);
  await expect(dock).toHaveClass(/terminal-dock--minimized/);
});
