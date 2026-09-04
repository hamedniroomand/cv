import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const PORT = 3457
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    // Cloudflare's documented always-pass test keys, so the captcha path runs without a real site.
    command: `PORT=${PORT} NUXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA NUXT_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA bun .output/server/index.mjs`,
    url: `${baseURL}/api/cv`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
})
