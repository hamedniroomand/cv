import { describe, expect, it } from 'vite-plus/test';

import { DotfileFrontmatter, DotfileSchema } from '#shared/schemas/dotfile';

const valid = {
  title: 'VS Code settings',
  description: 'My editor settings.',
  path: '~/.config/Code/User/settings.json',
  lang: 'jsonc',
  order: 1,
  gist: { id: 'dc74c846d1e701c65779fdaf7d58e1bf', file: 'VS Code settings' },
};

describe('DotfileFrontmatter', () => {
  it('accepts a gist-backed entry', () => {
    expect(DotfileFrontmatter.parse(valid)).toEqual(valid);
  });

  it('accepts an inline entry without gist', () => {
    const { gist: _gist, ...inline } = valid;
    expect(DotfileFrontmatter.parse(inline)).toEqual(inline);
  });

  it.each([
    ['no tilde prefix', '.config/x'],
    ['absolute path', '/home/hamed/.zshrc'],
    ['trailing slash', '~/.config/'],
    ['dot-dot segment', '~/.config/../x'],
    ['single dot segment', '~/./x'],
    ['bare tilde', '~/'],
  ])('rejects path with %s', (_label, path) => {
    expect(DotfileFrontmatter.safeParse({ ...valid, path }).success).toBe(false);
  });

  it('rejects a gist id that is not 32 hex characters', () => {
    expect(DotfileFrontmatter.safeParse({ ...valid, gist: { id: 'abc', file: 'f' } }).success).toBe(
      false,
    );
    expect(
      DotfileFrontmatter.safeParse({ ...valid, gist: { id: 'G'.repeat(32), file: 'f' } }).success,
    ).toBe(false);
  });

  it('rejects empty title, description, lang and a missing order', () => {
    expect(DotfileFrontmatter.safeParse({ ...valid, title: '' }).success).toBe(false);
    expect(DotfileFrontmatter.safeParse({ ...valid, description: '' }).success).toBe(false);
    expect(DotfileFrontmatter.safeParse({ ...valid, lang: '' }).success).toBe(false);
    const { order: _order, ...noOrder } = valid;
    expect(DotfileFrontmatter.safeParse(noOrder).success).toBe(false);
  });
});

describe('DotfileSchema', () => {
  it('requires non-empty content and a source', () => {
    const loaded = {
      ...valid,
      slug: 'vscode-settings',
      content: '{}',
      html: '<div class="shj shj-lang-jsonc shj-oneline" data-lang="jsonc">{}</div>',
      source: 'gist',
      gistUrl: 'https://gist.github.com/hamedniroomand/dc74c846d1e701c65779fdaf7d58e1bf',
    };
    expect(DotfileSchema.parse(loaded)).toEqual(loaded);
    expect(DotfileSchema.safeParse({ ...loaded, content: '' }).success).toBe(false);
    expect(DotfileSchema.safeParse({ ...loaded, source: 'remote' }).success).toBe(false);
  });
});
