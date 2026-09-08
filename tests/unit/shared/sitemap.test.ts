import { expect, it } from 'vite-plus/test';

import { indexableRoutes, sitemapXml } from '#shared/cv/sitemap';
import { fixtureCv } from '~~/tests/unit/fixtures/cv';

it('lists the home page, the projects and the dotfiles', () => {
  expect(indexableRoutes(fixtureCv)).toEqual([
    '/',
    '/projects/cue',
    '/projects/kitdev',
    '/dotfiles',
    '/dotfiles/vscode-settings',
  ]);
});

it('keeps the resume out, because the resume is not for search engines', () => {
  expect(indexableRoutes(fixtureCv)).not.toContain('/cv');
});

it('writes one absolute address for each route', () => {
  const xml = sitemapXml('https://niroomand.dev', ['/', '/projects/cue']);
  expect(xml).toContain('<loc>https://niroomand.dev/</loc>');
  expect(xml).toContain('<loc>https://niroomand.dev/projects/cue</loc>');
  expect(xml.match(/<url>/g)).toHaveLength(2);
});

it('does not double the slash when the site address ends with one', () => {
  expect(sitemapXml('https://niroomand.dev/', ['/'])).toContain(
    '<loc>https://niroomand.dev/</loc>',
  );
});

it('starts with the xml declaration and one namespace', () => {
  const xml = sitemapXml('https://niroomand.dev', ['/']);
  expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  expect(xml).not.toContain('sitemap-video');
});

it('escapes a character that xml reserves', () => {
  expect(sitemapXml('https://niroomand.dev', ['/a&b'])).toContain('/a&amp;b');
});
