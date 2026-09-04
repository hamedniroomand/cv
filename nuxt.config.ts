import process from 'node:process'
import { SPLIT_MAX, SPLIT_MIN, SPLIT_PANEL_KEY, SPLIT_RATIO_KEY } from './shared/split.js'

const clarityId = process.env.NUXT_PUBLIC_SCRIPTS_CLARITY_ID

/**
 * Runs in <head> before the first paint: restores the stored theme, split ratio and panel state onto
 * <html> so the server-rendered layout already matches what the visitor saved. Mirrors useTheme/useSplitPane.
 */
const prePaintScript = [
  '(function(){try{var d=document.documentElement,g=function(k){return localStorage.getItem(k)};',
  'var t=g(\'cv:theme\');if(t){d.dataset.theme=t}',
  `var s=Number(g(${JSON.stringify(SPLIT_RATIO_KEY)}));if(s>=${SPLIT_MIN}&&s<=${SPLIT_MAX}){d.style.setProperty('--split',String(s))}`,
  `if(g(${JSON.stringify(SPLIT_PANEL_KEY)})==='closed'){d.dataset.panel='closed'}`,
  '}catch(e){}})()',
].join('')

/**
 * Microsoft Clarity, loaded after `load` so it never competes with the page's own assets. Omitted
 * entirely when no project ID is configured (local builds).
 */
const clarityScript = clarityId
  ? `(function(){function l(){(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityId)})}if(document.readyState==="complete"){l()}else{window.addEventListener("load",l,{once:true})}})()`
  : undefined

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  modules: ['./modules/cv-content', '@vercel/speed-insights'],
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: { strict: true, typeCheck: false },
  runtimeConfig: {
    discordWebhookUrl: '',
    public: { siteUrl: 'http://localhost:3000' },
  },
  experimental: {
    early404: true,
  },
  routeRules: {
    // Read-only JSON is fixed at build time: cache it at the edge after the first request.
    '/api/cv': { isr: true },
    '/hamed-niroomand-cv.pdf': {
      headers: {
        'Content-Disposition': 'attachment; filename="hamed-niroomand-cv.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  },
  // Vercel sets VERCEL=1 during build; without the vercel preset, Nitro emits a
  // Bun server layout and the CDN can serve sourcemaps as `/`.
  nitro: {
    preset: process.env.NITRO_PRESET ?? (process.env.VERCEL ? 'vercel' : 'bun'),
    // The resume is fixed at build time, so the page is prerendered to static HTML.
    prerender: { routes: ['/'], crawlLinks: false },
  },
  css: ['~/assets/css/tokens.css', '~/assets/css/themes.css', '~/assets/css/crt.css', '~/assets/css/base.css'],
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
      script: [
        {
          innerHTML: prePaintScript,
          tagPosition: 'head',
        },
        ...(clarityScript ? [{ innerHTML: clarityScript, tagPosition: 'bodyClose' as const }] : []),
      ],
    },
  },
})
