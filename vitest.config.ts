import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '~': root('./app'),
      '~~': root('.'),
      '#server': root('./server'),
      '#shared': root('./shared'),
      '#cv': root('./tests/unit/fixtures/cv-module.ts'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    isolate: false,
    coverage: {
      include: ['app/terminal/**', 'shared/**', 'modules/**', 'server/utils/**'],
      exclude: ['modules/cv-content/index.ts'],
      reporter: ['text', 'lcov', 'json-summary'],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 90 },
    },
  },
})
