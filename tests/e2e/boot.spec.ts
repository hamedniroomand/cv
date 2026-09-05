import { expect, test } from '@playwright/test';

import { openApp, openTerminal, runCommand } from './helpers';

test.describe('desktop terminal', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('boot then whoami shows key facts while the panel is server-rendered', async ({
    page,
    request,
  }) => {
    const { profile } = await (await request.get('/api/cv')).json();
    const response = await page.goto('/');
    const html = await response!.text();
    expect(html).toContain('Jack Westin');
    expect(html).toContain('hamed@localhost:~$');
    expect(html).toMatch(/<h1[^>]*>Hamed Niroomand<\/h1>/);

    const log = page.getByRole('log');
    await expect(log).toContainText('Hamed Niroomand', { timeout: 5000 });
    await expect(log).toContainText(profile.title);
    await expect(log).toContainText("Type 'help'");
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hamed Niroomand');
    await expect(page.getByRole('toolbar', { name: 'Terminal shortcuts' })).toHaveCount(0);
  });

  test('cd scrolls and highlights the matching panel entry', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');
    await input.fill('cd experience/thales');
    await input.press('Enter');
    await expect(page.locator('#exp-thales')).toHaveClass(/is-highlighted/);
    await expect(page.locator('#exp-thales')).toBeInViewport();
    await expect(page.getByLabel('Terminal input').locator('..')).toContainText(
      '~/experience/thales$',
    );
  });

  test('the prompt stays flush with the terminal edge when scrolled up through long output', async ({
    page,
  }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');
    await input.fill('cat projects/cue/README.md');
    await input.press('Enter');
    await expect(page.getByRole('log')).toContainText('MIT');

    await page.evaluate(() => {
      const terminal = document.querySelector<HTMLElement>('.terminal')!;
      terminal.scrollTop -= 200;
    });

    const gap = await page.evaluate(() => {
      const terminal = document.querySelector<HTMLElement>('.terminal')!;
      const footer = document.querySelector<HTMLElement>('.terminal__footer')!;
      return {
        scrollerPaddingBottom: getComputedStyle(terminal).paddingBottom,
        footerToEdge:
          terminal.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom,
      };
    });
    expect(gap.scrollerPaddingBottom).toBe('0px');
    expect(Math.abs(gap.footerToEdge)).toBeLessThan(1);
  });

  test('resizing across the mobile breakpoint and back keeps terminal history', async ({
    page,
  }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');
    await expect(page.getByRole('log')).toContainText("Type 'help'");
    await input.fill('echo keep-me');
    await input.press('Enter');
    await expect(page.getByRole('log')).toContainText('keep-me');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('tab', { name: 'Resume' })).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });

    const log = page.getByRole('log');
    await expect(log).toBeVisible();
    await expect(log).toContainText('keep-me');
    await expect(log.getByText("Type 'help'")).toHaveCount(1);
    await input.press('ArrowUp');
    await expect(input).toHaveValue('echo keep-me');
  });

  test('sudo is required for .secrets', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');
    await input.fill('cat ~/.secrets');
    await input.press('Enter');
    await expect(page.getByRole('log')).toContainText('cat: ~/.secrets: Permission denied');
    await input.fill('sudo cat ~/.secrets | head -n 1');
    await input.press('Enter');
    await expect(page.getByRole('log')).toContainText('vim');
  });

  test('tab completes paths', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');
    await input.fill('cat ab');
    await input.press('Tab');
    await expect(input).toHaveValue('cat about.md ');
  });
});

test.describe('typing without focus', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('printable keys reach the terminal input from anywhere on the page', async ({ page }) => {
    await page.goto('/');
    const input = await openTerminal(page);
    await page.getByRole('heading', { name: 'About' }).click();
    await expect(input).not.toBeFocused();
    await page.keyboard.type('help');
    await expect(input).toHaveValue('help');
    await expect(input).toBeFocused();
  });

  test('keys on a focused control and shortcuts stay where they are', async ({ page }) => {
    await page.goto('/');
    const input = await openTerminal(page);
    const divider = page.getByRole('separator', { name: 'Resize terminal and resume' });
    await divider.focus();
    await page.keyboard.type('x');
    await expect(input).toHaveValue('');
    await expect(divider).toBeFocused();
    await page.getByRole('heading', { name: 'About' }).click();
    await page.keyboard.press('Control+x');
    await expect(input).toHaveValue('');
  });

  test('typing while the contact modal is open does not reach the terminal', async ({ page }) => {
    await page.goto('/');
    const input = await openTerminal(page);
    await input.fill('contact');
    await input.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('heading').first().click();
    await page.keyboard.type('abc');
    await expect(input).toHaveValue('');
  });

  test('typing while the app is open reaches the app prompt', async ({ page }) => {
    const prompt = await openApp(page);
    await page.getByRole('heading', { name: 'About' }).click();
    await page.keyboard.type('/he');
    await expect(prompt).toHaveValue('/he');
    await expect(prompt).toBeFocused();
  });
});

test.describe('command history', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('the last commands survive a reload and are recalled with the arrow keys', async ({
    page,
  }) => {
    await page.goto('/');
    await runCommand(page, 'echo first');
    await runCommand(page, 'echo second');
    await page.reload();
    const input = await openTerminal(page);
    await input.press('ArrowUp');
    await expect(input).toHaveValue('echo second');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('echo first');
    await input.press('ArrowDown');
    await expect(input).toHaveValue('echo second');
  });
});
