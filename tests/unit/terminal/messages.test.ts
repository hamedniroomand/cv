import { describe, expect, it } from 'vite-plus/test';

import { unknownValueMessage } from '~/terminal/messages';

describe('unknownValueMessage', () => {
  it('names the command, the kind, the value and the options', () => {
    expect(unknownValueMessage('skills', 'category', 'x', ['a', 'b'])).toBe(
      "skills: unknown category 'x' (try: a, b)",
    );
  });
});
