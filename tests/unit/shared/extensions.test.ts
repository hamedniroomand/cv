import { expect, it } from 'vite-plus/test';

import { marketplaceUrl, parseExtensions } from '#shared/cv/extensions';

it('splits an id into the publisher and the name', () => {
  const [entry] = parseExtensions('vue.volar');
  expect(entry).toEqual({ id: 'vue.volar', publisher: 'vue', name: 'volar' });
});

it('keeps a dot inside the name with the name', () => {
  const [entry] = parseExtensions('ms-playwright.playwright.beta');
  expect(entry).toMatchObject({ publisher: 'ms-playwright', name: 'playwright.beta' });
});

it('ignores blank lines, comments and surrounding space', () => {
  const ids = parseExtensions('# editor\n\n  vue.volar  \nantfu.unocss\n\n').map(e => e.id);
  expect(ids).toEqual(['vue.volar', 'antfu.unocss']);
});

it('drops a line that is not a publisher and a name', () => {
  expect(parseExtensions('novendor\n.noname\nnopublisher.')).toEqual([]);
});

it('builds the marketplace address of an extension', () => {
  expect(marketplaceUrl('vue.volar')).toBe(
    'https://marketplace.visualstudio.com/items?itemName=vue.volar',
  );
});
