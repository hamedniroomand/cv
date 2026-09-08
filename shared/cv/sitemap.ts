import type { CvData } from '#shared/schemas/cv';

import { DOTFILES_INDEX, dotfilePath, projectPath } from './panel-target.ts';

type IndexableContent = Pick<CvData, 'projects' | 'dotfiles'>;

/**
 * Every page that a search engine may index.
 * The résumé is not here. It carries a `noindex` tag, because Hamed sends that link himself.
 */
export function indexableRoutes(cv: IndexableContent): string[] {
  return [
    '/',
    ...cv.projects.map(project => projectPath(project.slug)),
    DOTFILES_INDEX,
    ...cv.dotfiles.map(dotfile => dotfilePath(dotfile.slug)),
  ];
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds the sitemap.
 * The addresses come from the same value as the canonical tags, so the two always agree.
 */
export function sitemapXml(siteUrl: string, routes: readonly string[]): string {
  const origin = siteUrl.replace(/\/+$/, '');
  const entries = routes
    .map(route => `  <url>\n    <loc>${escapeXml(`${origin}${route}`)}</loc>\n  </url>`)
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    '',
  ].join('\n');
}
