// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  typescript: { strict: true, typeCheck: false },
  runtimeConfig: {
    resendApiKey: '',
    contactTo: '',
    contactFrom: 'cv@localhost',
    public: { siteUrl: 'http://localhost:3000' },
  },
  nitro: { preset: import.meta.env.NITRO_PRESET ?? 'bun' },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'color-scheme', content: 'dark light' }],
    },
  },
})
