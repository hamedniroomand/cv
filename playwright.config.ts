import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const PORT = 3457
const DISCORD_MOCK_PORT = 3458
const baseURL = `http://localhost:${PORT}`
const discordMockURL = `http://localhost:${DISCORD_MOCK_PORT}`
const reuseExistingServer = !process.env.CI

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
  webServer: [
    {
      command: 'bun tests/e2e/mock-discord.ts',
      url: `${discordMockURL}/health`,
      env: { PORT: String(DISCORD_MOCK_PORT) },
      reuseExistingServer,
      timeout: 10_000,
    },
    {
      command: 'bun .output/server/index.mjs',
      url: `${baseURL}/api/cv`,
      env: {
        PORT: String(PORT),
        NUXT_PUBLIC_SITE_URL: baseURL,
        NUXT_DISCORD_WEBHOOK_URL: `${discordMockURL}/webhook`,
        NUXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
        NUXT_TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      },
      reuseExistingServer,
      timeout: 30_000,
    },
  ],
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
