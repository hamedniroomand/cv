import { describe, expect, it } from 'vite-plus/test';

import { ContentError } from '~~/modules/cv-content/errors';
import { highlight, isKnownLanguage } from '~~/modules/cv-content/highlight';

describe('highlight', () => {
  it('emits class-based markup with a line gutter and no inline styles', () => {
    const html = highlight('{\n  // c\n  "a": 1\n}', 'jsonc', 'x.md');
    expect(html).toMatch(/^<div class="shj shj-lang-jsonc shj-multiline"/);
    expect(html).toContain(
      '<div class="shj-numbers"><div>1</div><div>2</div><div>3</div><div>4</div></div>',
    );
    expect(html).toContain('<span class="shj-cmnt">');
    expect(html).toContain('<span class="shj-num">1</span>');
    expect(html).not.toContain('style=');
  });

  it('accepts aliases and other config languages', () => {
    expect(highlight('export EDITOR=vim', 'zsh', 's.md')).toContain('shj-lang-zsh');
    expect(highlight('[core]\n  key = 1', 'toml', 't.md')).toContain('shj-lang-toml');
    expect(highlight('a: 1', 'yaml', 'y.md')).toContain('shj-lang-yaml');
  });

  it('throws ContentError naming the file for an unknown language', () => {
    expect(() => highlight('x', 'nope', 'content/dotfiles/bad.md')).toThrow(ContentError);
    expect(() => highlight('x', 'nope', 'content/dotfiles/bad.md')).toThrow(
      /content\/dotfiles\/bad\.md.*unknown lang "nope"/,
    );
  });

  it('knows languages and aliases', () => {
    expect(isKnownLanguage('json')).toBe(true);
    expect(isKnownLanguage('jsonc')).toBe(true);
    expect(isKnownLanguage('sh')).toBe(true);
    expect(isKnownLanguage('nope')).toBe(false);
  });
});
