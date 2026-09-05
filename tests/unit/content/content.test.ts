import { resolve } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

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

  it('orders experience newest first by the order field', async () => {
    const cv = await loadContent(dir, deps);
    const orders = cv.experience.map(e => e.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});
