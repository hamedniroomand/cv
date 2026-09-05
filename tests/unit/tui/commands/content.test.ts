import { describe, expect, it } from 'vite-plus/test';

import type { AppCommand } from '~/tui/types';
import { makeApp } from '~~/tests/unit/fixtures/app';

describe('content slash commands', () => {
  it('records View clear, status, and exit effects from a command run through the app', async () => {
    const effects: AppCommand = {
      name: 'view-effects',
      description: 'Exercise observable View effects',
      run: (_argv, ctx) => {
        ctx.view.print('discarded');
        ctx.view.clear();
        ctx.view.status('Ready');
        ctx.view.exit();
        return 0;
      },
    };
    const app = makeApp({ commands: [effects] });

    expect(await app.run('/view-effects')).toBe(0);
    expect(app.text()).toBe('');
    expect(app.calls.cleared).toBe(1);
    expect(app.calls.statuses).toEqual(['Ready']);
    expect(app.calls.exits).toBe(1);
  });

  it('/dotfiles picks a config file and opens it in the panel', async () => {
    const app = makeApp({ picks: ['vscode-settings'] });

    expect(await app.run('/dotfiles')).toBe(0);
    expect(app.text()).toBe(
      'Opened VS Code settings in the panel.\nRaw text: cat ~/.config/Code/User/settings.json',
    );
    expect(app.calls.revealed).toBe(1);
    expect(app.calls.navigate).toEqual([{ section: 'dotfiles', slug: 'vscode-settings' }]);
    expect(app.calls.pick[0]?.items).toEqual([
      {
        value: 'vscode-settings',
        label: 'VS Code settings',
        description: '~/.config/Code/User/settings.json',
        keywords: ['vscode-settings', 'jsonc'],
      },
    ]);
  });

  it('/dotfiles resolves a slug directly and reports unknown values', async () => {
    const app = makeApp();

    expect(await app.run('/dotfiles VSCODE-SETTINGS')).toBe(0);
    expect(app.calls.pick).toHaveLength(0);
    expect(await app.run('/dotfiles nope')).toBe(1);
    expect(app.text()).toContain('vscode-settings');
  });

  it('/experience picks a company and opens it in the panel with a raw-text hint', async () => {
    const app = makeApp({ picks: ['acme'] });

    expect(await app.run('/experience')).toBe(0);
    expect(app.text()).toBe('Opened Acme in the panel.\nRaw text: bat ~/experience/acme/README.md');
    expect(app.lines[1]!.spans).toEqual([
      { text: 'Raw text: bat ~/experience/acme/README.md', style: 'dim' },
    ]);
    expect(app.calls.revealed).toBe(1);
    expect(app.calls.navigate).toEqual([{ section: 'experience', slug: 'acme' }]);
    expect(app.calls.pick[0]?.items).toContainEqual(
      expect.objectContaining({
        value: 'acme',
        label: 'Acme',
        description: 'Team Lead · Sep 2022 – Aug 2026; Senior Developer · Jan 2022 – Sep 2022',
        keywords: expect.arrayContaining(['acme', 'Vue 3', 'Nuxt 4']),
      }),
    );
  });

  it.each([
    ['/experience acme', 'Opened Acme in the panel.'],
    ['/experience GLOB', 'Opened Globex in the panel.'],
  ])('%s resolves a slug or unique case-insensitive company prefix', async (line, heading) => {
    const app = makeApp();

    expect(await app.run(line)).toBe(0);
    expect(app.text()).toContain(heading);
    expect(app.calls.pick).toHaveLength(0);
  });

  it('/experience reports unknown values with valid slugs', async () => {
    const app = makeApp();

    expect(await app.run('/experience unknown')).toBe(1);
    expect(app.text()).toContain('acme, globex');
    expect(app.calls.navigate).toHaveLength(0);
    expect(app.calls.revealed).toBe(0);
  });

  it('/experience exposes company picker completions', () => {
    const app = makeApp();

    expect(app.complete('experience').map(item => item.value)).toEqual(['acme', 'globex']);
  });

  it('/projects opens the selected project in the panel', async () => {
    const app = makeApp({ picks: ['cue'] });

    expect(await app.run('/projects')).toBe(0);
    expect(app.text()).toBe('Opened Cue in the panel.\nRaw text: bat ~/projects/cue/README.md');
    expect(app.calls.revealed).toBe(1);
    expect(app.calls.navigate).toEqual([{ section: 'projects', slug: 'cue' }]);
  });

  it('/projects accepts a direct slug and reports unknown values with valid slugs', async () => {
    const selected = makeApp();
    const unknown = makeApp();

    expect(await selected.run('/projects CUE')).toBe(0);
    expect(selected.calls.pick).toHaveLength(0);
    expect(selected.text()).toContain('Opened Cue');
    expect(await unknown.run('/projects unknown')).toBe(1);
    expect(unknown.text()).toContain('cue');
  });

  it('/projects exposes project picker completions', () => {
    const app = makeApp();

    expect(app.complete('projects')).toContainEqual(
      expect.objectContaining({
        value: 'cue',
        label: 'Cue',
        description: 'Drive coding agents from GitHub labels.',
        keywords: expect.arrayContaining(['cue', 'TypeScript', 'Bun']),
      }),
    );
  });

  it('/skills opens a category in the panel and hints at the shell filter', async () => {
    const app = makeApp({ picks: ['frontend'] });

    expect(await app.run('/skills')).toBe(0);
    expect(app.text()).toBe('Opened Frontend in the panel.\nRaw text: skills --category frontend');
    expect(app.calls.shell).toEqual([]);
    expect(app.calls.revealed).toBe(1);
    expect(app.calls.navigate).toEqual([{ section: 'skills' }]);
  });

  it('/skills opens all categories in the panel', async () => {
    const app = makeApp({ picks: ['all'] });

    expect(await app.run('/skills')).toBe(0);
    expect(app.text()).toBe('Opened Skills in the panel.\nRaw text: skills');
    expect(app.calls.navigate).toEqual([{ section: 'skills' }]);
  });

  it('/skills exposes all and category picker completions', () => {
    const app = makeApp();

    expect(app.complete('skills')).toEqual([
      expect.objectContaining({ value: 'all', label: 'All skills' }),
      expect.objectContaining({ value: 'frontend', label: 'Frontend' }),
      expect.objectContaining({ value: 'backend', label: 'Backend' }),
    ]);
  });

  it.each(['/experience', '/projects', '/skills', '/dotfiles'])(
    '%s cancellation prints nothing and returns 130',
    async line => {
      const app = makeApp({ picks: [null] });

      expect(await app.run(line)).toBe(130);
      expect(app.text()).toBe('');
      expect(app.calls.navigate).toHaveLength(0);
      expect(app.calls.revealed).toBe(0);
      expect(app.calls.shell).toHaveLength(0);
    },
  );

  it('/about opens the profile summary in the panel', async () => {
    const app = makeApp();

    expect(await app.run('/about')).toBe(0);
    expect(app.text()).toBe('Opened About in the panel.\nRaw text: bat ~/about.md');
    expect(app.calls.revealed).toBe(1);
    expect(app.calls.navigate).toEqual([{ section: 'about' }]);
  });

  it('/education opens education in the panel', async () => {
    const app = makeApp();

    expect(await app.run('/education')).toBe(0);
    expect(app.text()).toBe('Opened Education in the panel.\nRaw text: bat ~/education.md');
    expect(app.calls.revealed).toBe(1);
    expect(app.calls.navigate).toEqual([{ section: 'education' }]);
  });
});
