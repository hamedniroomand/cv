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
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'color-scheme', content: 'dark light' }],
    },
  },
})
