import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  formatters: true,
  ignores: ['.output', '.nuxt', 'public', 'playwright-report', 'test-results'],
})
