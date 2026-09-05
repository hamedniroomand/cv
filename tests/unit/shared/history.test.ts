import { describe, expect, it } from 'vite-plus/test';

import { parseHistory } from '#shared/history';

describe('parseHistory', () => {
  it('returns the last lines up to the limit', () => {
    expect(parseHistory('["a","b","c"]', 2)).toEqual(['b', 'c']);
    expect(parseHistory('["a"]', 10)).toEqual(['a']);
  });

  it('drops blank and non-string entries', () => {
    expect(parseHistory('["a"," ",1,null,"b"]', 10)).toEqual(['a', 'b']);
  });

  it('returns nothing for missing, corrupt, non-array or zero-limit input', () => {
    expect(parseHistory(null, 10)).toEqual([]);
    expect(parseHistory('{', 10)).toEqual([]);
    expect(parseHistory('{"a":1}', 10)).toEqual([]);
    expect(parseHistory('["a"]', 0)).toEqual([]);
  });
});
