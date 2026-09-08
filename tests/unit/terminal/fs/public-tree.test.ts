import { expect, it } from 'vite-plus/test';

import { buildTree, HOME } from '~/terminal/fs/build-tree';
import { Vfs } from '~/terminal/fs/vfs';
import { fixtureCv } from '~~/tests/unit/fixtures/cv';

const publicFs = (): Vfs => new Vfs(buildTree(fixtureCv, true), { home: HOME });

it('public filesystem contains projects and dotfiles without private career content', () => {
  const fs = publicFs();
  expect(fs.exists('projects/cue/README.md')).toBe(true);
  expect(fs.exists('skills.json')).toBe(false);
  expect(fs.exists('education.md')).toBe(false);
  expect(fs.exists('.secrets')).toBe(false);
  expect(fs.readFile('about.md')).not.toContain('Team Lead');
});

it('publishes work history as flat files with no role titles', () => {
  const fs = publicFs();
  expect(fs.exists('experience/acme.md')).toBe(true);
  const readme = fs.readFile('experience/acme.md');
  expect(readme).toContain('Acme');
  expect(readme).toContain('Jan 2022 – Aug 2026');
  expect(readme).not.toContain('Team Lead');
  expect(readme).not.toContain('Senior Developer');
});

it('keeps highlights and résumé panel targets out of the public filesystem', () => {
  const fs = publicFs();
  expect(fs.exists('experience/acme/highlights')).toBe(false);
  expect(fs.stat('experience/acme.md').panel).toBeUndefined();
  expect(fs.stat('experience').panel).toBeUndefined();
});
