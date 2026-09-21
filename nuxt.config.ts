import process from 'node:process';

import { PDF_FILE } from './shared/pdf.ts';
import { SPLIT_MAX, SPLIT_MIN, SPLIT_PANEL_KEY, SPLIT_RATIO_KEY } from './shared/split.ts';
import { THEME_STORAGE_KEY } from './shared/theme.ts';

function prePaintScript(): string {
  return [
    '(function(){try{var d=document.documentElement,g=function(k){return localStorage.getItem(k)};',
    `var t=g(${JSON.stringify(THEME_STORAGE_KEY)});if(t){d.dataset.theme=t}`,
    `var s=Number(g(${JSON.stringify(SPLIT_RATIO_KEY)}));if(s>=${SPLIT_MIN}&&s<=${SPLIT_MAX}){d.style.setProperty('--split',String(s))}`,
    `if(g(${JSON.stringify(SPLIT_PANEL_KEY)})==='closed'){d.dataset.panel='closed'}`,
    '}catch(e){}})()',
  ].join('');
}

function nitroPreset(): string {
  return process.env.NITRO_PRESET ?? (process.env.VERCEL ? 'vercel' : 'bun');
}

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  modules: ['./modules/cv-content'],
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: {
    strict: true,
    typeCheck: true,
    // Add the tests and the build scripts to the app project. `nuxt typecheck` and the
    // type-aware lint then see them. Without this, a lint of one staged script cannot
    // resolve the node types.
    tsConfig: {
      include: ['../tests/**/*', '../scripts/**/*'],
      compilerOptions: { paths: { '#cv': ['../tests/unit/fixtures/cv-module.ts'] } },
    },
  },
  runtimeConfig: {
    discordWebhookUrl: '',
    turnstile: { secretKey: '' },
    public: { siteUrl: 'http://localhost:3000', turnstile: { siteKey: '' } },
  },
  future: { compatibilityVersion: 5 },
  experimental: {
    early404: true,
    payloadExtraction: 'client',
    defaults: {
      nuxtLink: {
        prefetchOn: { visibility: false, interaction: true },
      },
    },
    viewTransition: true,
  },
  routeRules: {
    '/api/cv': { isr: true },
    [`/${PDF_FILE}`]: {
      headers: {
        'X-Robots-Tag': 'noindex',
        'Content-Disposition': `attachment; filename="${PDF_FILE}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    },
  },
  nitro: {
    preset: nitroPreset(),
    prerender: { routes: ['/'], crawlLinks: false },
  },
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/themes.css',
    '~/assets/css/crt.css',
    '~/assets/css/base.css',
    '~/assets/css/code.css',
    '~/assets/css/public.css',
  ],
  features: {
    inlineStyles: true,
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'color-scheme', content: 'dark light' },
        { name: 'theme-color', content: '#151615' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      script: [
        { innerHTML: prePaintScript(), tagPosition: 'head' },
        {
          src: '/_uma.script.js',
          defer: true,
          'data-website-id': 'd9fa7c84-3b70-49bf-bc4b-60a370de1c18',
          tagPosition: 'head',
        },
        {
          src: '/_uma.screen.js',
          defer: true,
          'data-website-id': 'd9fa7c84-3b70-49bf-bc4b-60a370de1c18',
          tagPosition: 'head',
        },
      ],
    },
  },
});
