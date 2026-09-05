import { describe, expect, it } from 'vite-plus/test';

import { commands } from '~/terminal/commands';
import { makeShell } from '~~/tests/unit/fixtures/context';

describe('bat', () => {
  it('renders markdown with a dim file header and navigates the panel', async () => {
    const term = makeShell(commands);
    expect((await term.exec('bat projects/cue/README.md')).code).toBe(0);
    expect(term.lines[0]!.spans).toEqual([{ text: '── ~/projects/cue/README.md', style: 'dim' }]);
    expect(term.lines[1]!.spans).toEqual([{ text: 'Cue', style: 'accent' }]);
    expect(term.text()).toBe('── ~/projects/cue/README.md\nCue\n\nFallback readme.');
    expect(term.calls.navigate).toEqual([{ section: 'projects', slug: 'cue' }]);
  });

  it('prints non-markdown files as plain text', async () => {
    const term = makeShell(commands);
    await term.exec('bat skills.json | head -n 1');
    expect(term.text()).toBe('{');
  });

  it('reports errors like cat does', async () => {
    const term = makeShell(commands);
    expect((await term.exec('bat nope')).code).toBe(1);
    expect(term.text()).toBe('bat: nope: No such file or directory');
    expect((await term.exec('bat')).code).toBe(1);
  });

  it('respects sudo on .secrets', async () => {
    const term = makeShell(commands);
    expect((await term.exec('bat .secrets')).code).toBe(1);
    expect((await term.exec('sudo bat .secrets')).code).toBe(0);
  });
});
