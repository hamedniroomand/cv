export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-length': [2, 'always', 0],
    // Allow Co-authored-by trailers from editor integrations.
    'footer-max-length': [0],
  },
}
