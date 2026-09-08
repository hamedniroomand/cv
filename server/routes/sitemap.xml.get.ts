import { defineEventHandler } from 'nitro/h3';
import { useRuntimeConfig } from 'nitro/runtime-config';

import { cv } from '#cv';
import { indexableRoutes, sitemapXml } from '#shared/cv/sitemap';

export default defineEventHandler(event => {
  event.res.headers.set('content-type', 'application/xml; charset=utf-8');
  return sitemapXml(useRuntimeConfig().public.siteUrl, indexableRoutes(cv));
});
