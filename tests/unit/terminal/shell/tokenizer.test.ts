import { describe, expect, it } from 'vite-plus/test';

import { ShellSyntaxError } from '~/terminal/shell/errors';
import { tokenize } from '~/terminal/shell/tokenizer';

const w = (value: string) => ({ type: 'word', value });
const p = () => ({ type: 'pipe' });

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(tokenize('ls  -la   experience')).toEqual([w('ls'), w('-la'), w('experience')]);
  });

  it('handles quotes', () => {
    expect(tokenize(`echo "hello world" 'it''s'`)).toEqual([w('echo'), w('hello world'), w('its')]);
    expect(tokenize(`grep "a|b" x`)).toEqual([w('grep'), w('a|b'), w('x')]);
    expect(tokenize(`echo ""`)).toEqual([w('echo'), w('')]);
  });

  it('handles escapes outside quotes and inside double quotes', () => {
    expect(tokenize('echo a\\ b \\| c')).toEqual([w('echo'), w('a b'), w('|'), w('c')]);
    expect(tokenize('echo "a\\"b"')).toEqual([w('echo'), w('a"b')]);
    expect(tokenize(`echo 'a\\b'`)).toEqual([w('echo'), w('a\\b')]);
  });

  it('emits pipe tokens', () => {
    expect(tokenize('cat a|grep b | wc -l')).toEqual([
      w('cat'),
      w('a'),
      p(),
      w('grep'),
      w('b'),
      p(),
      w('wc'),
      w('-l'),
    ]);
  });

  it('throws on unterminated quote', () => {
    expect(() => tokenize('echo "oops')).toThrow(ShellSyntaxError);
    expect(() => tokenize(`echo 'oops`)).toThrow(/unterminated/);
  });

  it('returns [] for blank', () => expect(tokenize('   ')).toEqual([]));
});
