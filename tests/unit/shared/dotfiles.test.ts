import { describe, expect, it } from 'vite-plus/test';

import { dotfileDir, splitDotfilePath } from '#shared/cv/dotfiles';

describe('splitDotfilePath', () => {
  it('splits directories from the file name', () => {
    expect(splitDotfilePath('~/.config/Code/User/settings.json')).toEqual({
      dirs: ['.config', 'Code', 'User'],
      name: 'settings.json',
    });
    expect(splitDotfilePath('~/.zshrc')).toEqual({ dirs: [], name: '.zshrc' });
  });
});

describe('dotfileDir', () => {
  it('returns the tilde directory of a dotfile', () => {
    expect(dotfileDir('~/.config/Code/User/settings.json')).toBe('~/.config/Code/User');
    expect(dotfileDir('~/.zshrc')).toBe('~');
  });
});
