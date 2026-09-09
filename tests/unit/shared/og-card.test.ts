import { expect, it } from 'vite-plus/test';

import { ogCardFile } from '#shared/cv/og-card';

it('names the resume card without a suffix, because that name is already published', () => {
  expect(ogCardFile('resume')).toBe('og.png');
});

it('names every other card after the page it belongs to', () => {
  expect(ogCardFile('home')).toBe('og-home.png');
  expect(ogCardFile('dotfiles')).toBe('og-dotfiles.png');
  expect(ogCardFile('cue')).toBe('og-cue.png');
  expect(ogCardFile('kitdev')).toBe('og-kitdev.png');
});
