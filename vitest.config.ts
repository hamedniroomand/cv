import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '#cv': fileURLToPath(new URL('./tests/unit/fixtures/cv-module.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      include: ['app/terminal/**', 'shared/**', 'modules/**', 'server/utils/**'],
      // Nuxt module wiring — not meaningfully unit-testable without a Nuxt runtime.
      exclude: ['modules/cv-content/index.ts'],
      reporter: ['text', 'lcov', 'json-summary'],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 90 },
    },
  },
})
