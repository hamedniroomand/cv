import process from 'node:process';

import { PDF_FILE } from './shared/pdf.js';
import { SPLIT_MAX, SPLIT_MIN, SPLIT_PANEL_KEY, SPLIT_RATIO_KEY } from './shared/split.js';
import { THEME_STORAGE_KEY } from './shared/theme.js';

function prePaintScript(): string {
  return [
    '(function(){try{var d=document.documentElement,g=function(k){return localStorage.getItem(k)};',
    `var t=g(${JSON.stringify(THEME_STORAGE_KEY)});if(t){d.dataset.theme=t}`,
    `var s=Number(g(${JSON.stringify(SPLIT_RATIO_KEY)}));if(s>=${SPLIT_MIN}&&s<=${SPLIT_MAX}){d.style.setProperty('--split',String(s))}`,
    `if(g(${JSON.stringify(SPLIT_PANEL_KEY)})==='closed'){d.dataset.panel='closed'}`,
    '}catch(e){}})()',
  ].join('');
}

function clarityScript(projectId: string): string {
  const tag = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(projectId)})`;
  return `(function(){function l(){${tag}}if(document.readyState==="complete"){l()}else{window.addEventListener("load",l,{once:true})}})()`;
}

function headScripts() {
  const clarityId = process.env.NUXT_PUBLIC_SCRIPTS_CLARITY_ID;
  const scripts: { innerHTML: string; tagPosition: 'head' | 'bodyClose' }[] = [
    { innerHTML: prePaintScript(), tagPosition: 'head' },
  ];
  if (clarityId) scripts.push({ innerHTML: clarityScript(clarityId), tagPosition: 'bodyClose' });
  return scripts;
}

function nitroPreset(): string {
  return process.env.NITRO_PRESET ?? (process.env.VERCEL ? 'vercel' : 'bun');
}

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  modules: ['./modules/cv-content', '@vercel/speed-insights', '@vercel/analytics'],
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: {
    strict: true,
    typeCheck: true,
    // Cover unit/e2e tests with the app project so `nuxt typecheck` and type-aware lint see them.
    tsConfig: {
      include: ['../tests/**/*'],
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
  },
  routeRules: {
    '/api/cv': { isr: true },
    [`/${PDF_FILE}`]: {
      headers: {
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
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'color-scheme', content: 'dark light' },
        { name: 'theme-color', content: '#10141c' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      script: headScripts(),
    },
  },
});
