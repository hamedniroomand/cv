import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';

const root = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

const generated = [
  '.nuxt',
  '.output',
  '.nitro',
  '.cache',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
];

export default defineConfig({
  fmt: {
    ignorePatterns: ['content/**'],
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    singleAttributePerLine: true,
    useTabs: false,
    trailingComma: 'all',
    quoteProps: 'as-needed',
    objectWrap: 'preserve',
    insertFinalNewline: true,
    endOfLine: 'lf',
    arrowParens: 'avoid',
    embeddedLanguageFormatting: 'auto',
    bracketSameLine: false,
    bracketSpacing: true,
    printWidth: 100,
    sortPackageJson: true,
    jsxSingleQuote: false,
    vueIndentScriptAndStyle: true,
    proseWrap: 'preserve',
    sortImports: {
      internalPattern: ['@/', '~/', '~~/', '#shared/', '#cv/', '#server/'],
    },
  },

  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'import', 'promise', 'vue', 'vitest'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    categories: {
      correctness: 'error',
      suspicious: 'warn',
      perf: 'warn',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    env: { builtin: true, es2026: true, browser: true, node: true },
    ignorePatterns: [...generated, 'public', 'content', 'docs', '**/*.md'],
    rules: {
      eqeqeq: ['error', 'smart'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }],
      'typescript/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      'typescript/no-explicit-any': 'warn',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-mutable-exports': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/error-message': 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
      'typescript/no-unsafe-type-assertion': 'off',
      'unicorn/no-array-sort': 'off',
      'vitest/valid-expect': ['error', { maxArgs: 2 }],
      'vitest/require-mock-type-parameters': 'off',
      'no-await-in-loop': 'off',
    },
    overrides: [
      {
        files: ['scripts/**', '*.config.*'],
        rules: { 'no-console': 'off' },
      },
      {
        files: ['tests/**'],
        rules: { 'typescript/no-explicit-any': 'off', 'typescript/no-base-to-string': 'off' },
      },
    ],
  },

  // Run tests through `vp run test` (Bun): the content module uses `Bun.YAML`, and `vp test` runs on Node.
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    isolate: false,
    // Under the Bun runtime, Vitest's externalised `zod` import resolves to undefined; let Vite transform it instead.
    server: { deps: { inline: ['zod'] } },
    coverage: {
      include: ['app/terminal/**', 'shared/**', 'modules/**', 'server/utils/**'],
      exclude: ['modules/cv-content/index.ts'],
      reporter: ['text', 'lcov', 'json-summary'],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 90 },
    },
  },

  resolve: {
    alias: {
      '~': root('./app'),
      '~~': root('.'),
      '#server': root('./server'),
      '#shared': root('./shared'),
      '#cv': root('./tests/unit/fixtures/cv-module.ts'),
    },
  },

  staged: {
    '*.{ts,mts,cts,js,mjs,cjs,vue}': 'vp check --fix',
    '*.{json,yml,yaml,css}': 'vp fmt',
  },

  run: {
    tasks: {
      'build:e2e': {
        command:
          'NUXT_PUBLIC_SITE_URL=http://localhost:3457 NUXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA bun --bun nuxt build',
        env: ['NUXT_PUBLIC_SITE_URL', 'NUXT_PUBLIC_TURNSTILE_SITE_KEY'],
      },
      'test:e2e': {
        command: 'playwright test',
        dependsOn: ['build:e2e'],
      },
    },
  },
});
