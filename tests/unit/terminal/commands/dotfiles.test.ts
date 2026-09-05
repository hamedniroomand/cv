import { describe, expect, it } from 'vite-plus/test';

import { commands } from '~/terminal/commands';
import { makeShell } from '~~/tests/unit/fixtures/context';
import { fixtureCv } from '~~/tests/unit/fixtures/cv';

describe('dotfiles', () => {
  it('lists every dotfile with its path and page link, then navigates to the index', async () => {
    const term = makeShell(commands);
    expect((await term.exec('dotfiles')).code).toBe(0);
    const out = term.text();
    expect(out).toContain('VS Code settings');
    expect(out).toContain('~/.config/Code/User/settings.json');
    const hrefs = term.lines
      .flatMap(l => l.spans)
      .map(sp => sp.href)
      .filter(Boolean);
    expect(hrefs).toEqual(['https://hamed.test/dotfiles/vscode-settings']);
    expect(term.calls.navigate).toEqual([{ section: 'dotfiles' }]);
  });

  it('says so when there are none', async () => {
    const term = makeShell(commands, { cv: { ...fixtureCv, dotfiles: [] } });
    expect((await term.exec('dotfiles')).code).toBe(0);
    expect(term.text()).toBe('No dotfiles published yet.');
  });

  it('is listed by help', async () => {
    const term = makeShell(commands);
    await term.exec('help');
    expect(term.text()).toContain('dotfiles');
  });
});
