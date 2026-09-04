export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-length': [2, 'always', 0],
    'footer-max-length': [2, 'always', 0],
  },
}
