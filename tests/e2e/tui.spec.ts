import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openApp } from './helpers';

test.describe('desktop interactive app', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('opens, filters commands, picks experience, runs shell, and restores scrollback', async ({
    page,
  }) => {
    const prompt = await openApp(page);

    await prompt.fill('/exp');
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toContainText(
      '/experience',
    );
    await prompt.press('Enter');
    await page.getByRole('option', { name: /Thales MFI GmbH/ }).click();
    await expect(page.locator('#exp-thales')).toHaveClass(/is-highlighted/);

    await prompt.fill('ls');
    await prompt.press('Enter');
    const output = page.getByRole('log', { name: 'App output' });
    await expect(output).toContainText('about.md');
    const echoes = output.locator('.output__line', { hasText: /^› / });
    await expect(echoes).toHaveCount(2);
    await expect(echoes.nth(0)).toContainText('/experience');
    await expect(echoes.nth(1)).toHaveText('› ls');

    await prompt.press('Escape');
    await expect(page.getByLabel('Terminal input')).toBeFocused();
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText(
      'Hamed Niroomand',
    );
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('hamed: exited');
  });

  test('slash opens every command and options support pointer selection', async ({ page }) => {
    const prompt = await openApp(page);
    await prompt.fill('/');

    const menu = page.getByRole('listbox', { name: 'Slash commands' });
    await expect(menu).toHaveAttribute('id', 'tui-slash-listbox');
    await expect(menu.getByRole('option')).toHaveCount(13);
    await expect(menu.locator('.slash-menu__name')).toHaveText([
      '/about',
      '/api',
      '/clear',
      '/contact',
      '/dotfiles',
      '/education',
      '/exit',
      '/experience',
      '/help',
      '/pdf',
      '/projects',
      '/skills',
      '/theme',
    ]);
    await expect(prompt).toHaveAttribute('id', 'tui-app-prompt');
    await expect(prompt).toHaveAttribute('aria-controls', 'tui-slash-listbox');
    await expect(prompt).toHaveAttribute('aria-expanded', 'true');

    const help = page.getByRole('option', { name: /^\/help\b/ });
    await expect(help).toHaveAttribute('id', 'tui-slash-option-help');
    await help.click();
    await expect(page.getByRole('log', { name: 'App output' })).toContainText(
      'Plain text runs as a shell command.',
    );
  });

  test('menu arrows wrap and Tab completes the highlighted command', async ({ page }) => {
    const prompt = await openApp(page);
    await prompt.fill('/');

    await expect(prompt).toHaveAttribute('aria-activedescendant', 'tui-slash-option-about');
    await prompt.press('ArrowUp');
    await expect(prompt).toHaveAttribute('aria-activedescendant', 'tui-slash-option-theme');
    await prompt.press('ArrowDown');
    await expect(prompt).toHaveAttribute('aria-activedescendant', 'tui-slash-option-about');

    await prompt.fill('/exp');
    await prompt.press('Tab');
    await expect(prompt).toHaveValue('/experience ');
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toContainText(
      'Thales MFI GmbH',
    );
  });

  test('menu Escape closes suggestions without changing prompt text', async ({ page }) => {
    const prompt = await openApp(page);
    await prompt.fill('/exp');
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toBeVisible();

    await prompt.press('Escape');
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toBeHidden();
    await expect(prompt).toHaveValue('/exp');
  });

  test('Enter submits unknown commands and invalid arguments when the menu has no matches', async ({
    page,
  }) => {
    const prompt = await openApp(page);
    const output = page.getByRole('log', { name: 'App output' });

    await prompt.fill('/unknown');
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toContainText('No matches');
    await prompt.press('Enter');
    await expect(output).toContainText('hamed: unknown command /unknown — type / to see the list');

    await prompt.fill('/experience invalid');
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toContainText('No matches');
    await prompt.press('Enter');
    await expect(output).toContainText("experience: unknown company 'invalid'");
  });

  test('picker filters, wraps, selects, and exposes stable option ids', async ({ page }) => {
    const prompt = await openApp(page);
    await prompt.fill('/experience');
    await prompt.press('Enter');

    const picker = page.getByRole('listbox', { name: 'Choose a company' });
    await expect(picker).toBeFocused();
    await expect(picker).toHaveAttribute('id', 'tui-picker-listbox');
    await picker.press('t');
    await picker.press('h');
    await expect(page.getByRole('option')).toHaveCount(1);
    const thales = page.getByRole('option', { name: /Thales MFI GmbH/ });
    await expect(thales).toHaveAttribute('id', /^tui-picker-option-\d+$/);
    const thalesId = await thales.getAttribute('id');
    await picker.press('ArrowUp');
    await expect(picker).toHaveAttribute('aria-activedescendant', thalesId!);
    await picker.press('Enter');
    await expect(page.locator('#exp-thales')).toHaveClass(/is-highlighted/);
  });

  test('arrow navigation keeps overflowing menu and picker selections visible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 320 });
    const prompt = await openApp(page);
    await prompt.fill('/');

    const menu = page.getByRole('listbox', { name: 'Slash commands' });
    expect(await menu.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    await prompt.press('ArrowUp');
    const activeMenuId = await prompt.getAttribute('aria-activedescendant');
    expect(
      await menu.evaluate((element, activeId) => {
        const active = document.getElementById(activeId ?? '');
        if (!active) return false;
        const listRect = element.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        return activeRect.top >= listRect.top && activeRect.bottom <= listRect.bottom;
      }, activeMenuId),
    ).toBe(true);
    await prompt.press('Enter');

    const picker = page.getByRole('listbox', { name: 'Choose a theme' });
    expect(await picker.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(
      true,
    );
    await picker.press('ArrowUp');
    expect(
      await picker.evaluate(element => {
        const active = document.getElementById(element.getAttribute('aria-activedescendant') ?? '');
        if (!active) return false;
        const listRect = element.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        return activeRect.top >= listRect.top && activeRect.bottom <= listRect.bottom;
      }),
    ).toBe(true);
  });

  test('Escape and Ctrl+C cancel a picker and restore prompt focus', async ({ page }) => {
    const prompt = await openApp(page);
    await prompt.fill('/experience');
    await prompt.press('Enter');
    const picker = page.getByRole('listbox', { name: 'Choose a company' });

    await picker.press('Escape');
    await expect(picker).toBeHidden();
    await expect(prompt).toBeFocused();

    await prompt.fill('/experience');
    await prompt.press('Enter');
    await page.getByRole('listbox', { name: 'Choose a company' }).press('Control+c');
    await expect(page.getByRole('listbox', { name: 'Choose a company' })).toBeHidden();
    await expect(prompt).toBeFocused();
  });

  test('Ctrl+L clears app output from the prompt, picker, and another app control', async ({
    page,
  }) => {
    const prompt = await openApp(page);
    const output = page.getByRole('log', { name: 'App output' });
    await prompt.fill('ls');
    await prompt.press('Enter');
    await expect(output).toContainText('about.md');

    await prompt.press('Control+l');
    await expect(output).toBeEmpty();

    await prompt.fill('ls');
    await prompt.press('Enter');
    await expect(output).toContainText('about.md');
    await prompt.fill('/experience');
    await prompt.press('Enter');
    const picker = page.getByRole('listbox', { name: 'Choose a company' });
    await picker.press('Control+l');
    await expect(output).toBeEmpty();
    await expect(picker).toBeVisible();
    await picker.press('Control+c');

    await prompt.fill('ls');
    await prompt.press('Enter');
    await expect(output).toContainText('about.md');
    const exit = page.getByRole('button', { name: 'Esc · exit' });
    await exit.focus();
    await exit.press('Control+l');
    await expect(output).toBeEmpty();

    await prompt.focus();
    await prompt.press('Escape');
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText(
      'Hamed Niroomand',
    );
  });

  test('app history is local and restores the draft after arrow navigation', async ({ page }) => {
    const prompt = await openApp(page);
    const output = page.getByRole('log', { name: 'App output' });
    await prompt.fill('pwd');
    await prompt.press('Enter');
    await expect(output).toContainText('/home/hamed');
    await prompt.fill('ls');
    await prompt.press('Enter');
    await expect(output).toContainText('about.md');

    await prompt.fill('draft');
    await prompt.press('ArrowUp');
    await expect(prompt).toHaveValue('ls');
    await prompt.press('ArrowUp');
    await expect(prompt).toHaveValue('pwd');
    await prompt.press('ArrowDown');
    await expect(prompt).toHaveValue('ls');
    await prompt.press('ArrowDown');
    await expect(prompt).toHaveValue('draft');
  });

  test('a slash outside column zero falls through to shell parsing', async ({ page }) => {
    const prompt = await openApp(page);
    await prompt.fill('echo /experience');
    await expect(page.getByRole('listbox', { name: 'Slash commands' })).toBeHidden();
    await prompt.press('Enter');
    await expect(page.getByRole('log', { name: 'App output' })).toContainText('/experience');
  });

  test('Escape from outside the app closes it', async ({ page }) => {
    await openApp(page);
    await page.getByRole('heading', { name: 'About' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByLabel('Terminal input')).toBeVisible();
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('hamed: exited');
  });

  test('empty Escape and Ctrl+D exit the app', async ({ page }) => {
    let prompt = await openApp(page);
    await prompt.press('Escape');
    await expect(page.getByLabel('Terminal input')).toBeFocused();

    prompt = await openApp(page);
    await prompt.press('Control+d');
    await expect(page.getByLabel('Terminal input')).toBeFocused();
    await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('hamed: exited');
  });
});

function headerEscape(page: Page): Locator {
  return page
    .getByRole('region', { name: 'Interactive app' })
    .getByRole('button', { name: /^Esc · / });
}

async function expectAccessibleOptionNames(list: Locator): Promise<void> {
  const options = list.getByRole('option');
  const count = await options.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index++)
    await expect(options.nth(index)).toHaveAccessibleName(/.+/);
}

async function clippedFocusableAppControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const root = document.querySelector('[aria-label="Interactive app"]');
    if (!(root instanceof HTMLElement)) return ['interactive app'];

    const names: string[] = [];
    const selectors = 'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';
    for (const node of root.querySelectorAll(selectors)) {
      const el = node as HTMLElement;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0)
        continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (rect.left < -0.5 || rect.top < -0.5 || rect.right > vw + 0.5 || rect.bottom > vh + 0.5)
        names.push(el.getAttribute('aria-label') || el.id || el.tagName);
    }
    return names;
  });
}

test.describe('mobile interactive app', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('tapping slash and picker options opens experience', async ({ page }) => {
    const prompt = await openApp(page);
    await prompt.fill('/');
    await page.getByRole('option', { name: /^\/experience\b/ }).click();
    await page.getByRole('option', { name: /Thales MFI GmbH/ }).click();
    await expect(page.getByRole('tab', { name: 'Resume' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('#exp-thales')).toBeVisible();
    await expect(page.locator('#exp-thales')).toHaveClass(/is-highlighted/);
    await page.getByRole('tab', { name: 'Terminal' }).click();
    await expect(page.getByRole('log', { name: 'App output' })).toContainText(
      'Opened Thales MFI GmbH in the panel.',
    );
    await expect(page.getByRole('combobox', { name: 'App command' })).toBeVisible();
  });
});

test.describe('app commands reveal the panel', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('a content command reopens a closed panel and prints only a confirmation', async ({
    page,
  }) => {
    const prompt = await openApp(page);
    await page.keyboard.press('Control+`');
    await expect(page.locator('html')).toHaveAttribute('data-panel', 'closed');
    await prompt.fill('/about');
    await prompt.press('Enter');
    await expect(page.locator('html')).not.toHaveAttribute('data-panel', 'closed');
    const output = page.getByRole('log', { name: 'App output' });
    await expect(output).toContainText('Opened About in the panel.');
    await expect(output).toContainText('Raw text: bat ~/about.md');
    await expect(output).not.toContainText('senior web developer based in Yerevan');
    await expect(page.locator('#section-about')).toHaveClass(/is-highlighted/);
  });
});

test.describe('interactive app accessibility', () => {
  test('options, expanded prompt, status text, and tappable escape stay usable', async ({
    page,
  }) => {
    const prompt = await openApp(page);

    await expect(page.getByText('Type / for commands · ↑↓ to choose · Esc to leave')).toBeVisible();

    await prompt.fill('/');
    await expect(prompt).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('listbox', { name: 'Slash commands' });
    await expectAccessibleOptionNames(menu);

    const esc = headerEscape(page);
    await expect(esc).toHaveText('Esc · close menu');
    await expect(esc).toHaveAccessibleName('Esc · close menu');
    await expect(esc).not.toHaveText(/exit/i);
    await expect(esc).not.toHaveAccessibleName(/exit/i);

    await esc.click();
    await expect(menu).toBeHidden();
    await expect(page.getByRole('heading', { name: /hamed 1\.0/i })).toBeVisible();
    await expect(prompt).toHaveValue('/');
    await expect(prompt).toHaveAttribute('aria-expanded', 'false');
    await expect(esc).toHaveText('Esc · exit');
    await expect(esc).toHaveAccessibleName('Esc · exit');

    await prompt.fill('/experience');
    await prompt.press('Enter');
    const picker = page.getByRole('listbox', { name: 'Choose a company' });
    await expect(picker).toBeVisible();
    await expectAccessibleOptionNames(picker);
    await expect(esc).toHaveText('Esc · cancel');
    await expect(esc).toHaveAccessibleName('Esc · cancel');

    await headerEscape(page).click();
    await expect(picker).toBeHidden();
    await expect(page.getByRole('heading', { name: /hamed 1\.0/i })).toBeVisible();
    await expect(prompt).toBeFocused();
    await expect(esc).toHaveText('Esc · exit');
    await expect(esc).toHaveAccessibleName('Esc · exit');

    await headerEscape(page).click();
    await expect(page.getByLabel('Terminal input')).toBeFocused();
  });

  test('no focusable app control is clipped at 390×844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const prompt = await openApp(page);
    await prompt.fill('/');
    expect(await clippedFocusableAppControls(page)).toEqual([]);

    await prompt.fill('/experience');
    await prompt.press('Enter');
    await expect(page.getByRole('listbox', { name: 'Choose a company' })).toBeVisible();
    expect(await clippedFocusableAppControls(page)).toEqual([]);
  });
});
