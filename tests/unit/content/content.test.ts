import { resolve } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import { parseExtensions } from '#shared/cv/extensions';
import type { LoadDeps } from '~~/modules/cv-content/load';
import { loadContent } from '~~/modules/cv-content/load';

const dir = resolve('content');
const deps: LoadDeps = {
  fetchReadme: async () => null,
  fetchGist: async () => null,
  highlight: code => code,
};

describe('content rules', () => {
  it('has no design-pattern name-dropping in highlights', async () => {
    const cv = await loadContent(dir, deps);
    const text = cv.experience
      .flatMap(e => e.highlights.map(h => h.body))
      .join('\n')
      .toLowerCase();
    for (const word of [
      'singleton',
      'factory pattern',
      'observer pattern',
      'solid principles',
      'clean architecture',
    ])
      expect(text).not.toContain(word);
  });

  // `vp fmt` once read these bodies as prose and flattened them. `fmt.ignorePatterns` in
  // vite.config.ts stops that, and the next two rules fail if it starts again.
  it('keeps the indentation of the committed dotfile bodies', async () => {
    const cv = await loadContent(dir, deps);
    // A `text` file is a flat list, so it has no indentation to lose.
    for (const dotfile of cv.dotfiles.filter(entry => entry.lang !== 'text')) {
      const lines = dotfile.content.split('\n');
      expect(
        lines.some(line => /^\s+\S/.test(line)),
        dotfile.slug,
      ).toBe(true);
    }
  });

  it('keeps one entry per line in the committed list dotfiles', async () => {
    const cv = await loadContent(dir, deps);
    const lists = cv.dotfiles.filter(entry => entry.registry !== undefined);
    expect(lists.length).toBeGreaterThan(0);
    for (const dotfile of lists) {
      const lines = dotfile.content.trim().split('\n');
      expect(lines.length, dotfile.slug).toBeGreaterThan(5);
      expect(parseExtensions(dotfile.content), dotfile.slug).toHaveLength(lines.length);
    }
  });

  it('orders experience newest first by the order field', async () => {
    const cv = await loadContent(dir, deps);
    const orders = cv.experience.map(e => e.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});
