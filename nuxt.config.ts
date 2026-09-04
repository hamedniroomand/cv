import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  modules: ['./modules/cv-content'],
  typescript: { strict: true, typeCheck: false },
  runtimeConfig: {
    resendApiKey: '',
    contactTo: '',
    contactFrom: 'cv@localhost',
    public: { siteUrl: 'http://localhost:3000' },
  },
  nitro: { preset: process.env.NITRO_PRESET ?? 'bun' },
  css: ['~/assets/css/tokens.css', '~/assets/css/themes.css', '~/assets/css/base.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'color-scheme', content: 'dark light' }],
      script: [
        {
          // Apply the stored theme before first paint so there is no flash. Mirrors useTheme().
          innerHTML: `(function(){try{var t=localStorage.getItem('cv:theme');if(t){document.documentElement.dataset.theme=t}}catch(e){}})()`,
          tagPosition: 'head',
        },
      ],
    },
  },
})
