import { describe, expect, it } from 'vite-plus/test';

import { byteLength, ensureNewline, splitLines, wrapText } from '~/terminal/io/text';

describe('splitLines', () => {
  it('drops the trailing empty line', () => {
    expect(splitLines('a\nb\n')).toEqual(['a', 'b']);
    expect(splitLines('a\nb')).toEqual(['a', 'b']);
    expect(splitLines('')).toEqual([]);
  });
});

describe('byteLength', () => {
  it('counts UTF-8 bytes', () => {
    expect(byteLength('abc')).toBe(3);
    expect(byteLength('é')).toBe(2);
  });
});

describe('ensureNewline', () => {
  it('adds one newline when missing', () => {
    expect(ensureNewline('a')).toBe('a\n');
    expect(ensureNewline('a\n')).toBe('a\n');
  });
});

describe('wrapText', () => {
  it('wraps words at the width', () => {
    expect(wrapText('one two three four', 9)).toEqual(['one two', 'three', 'four']);
  });

  it('keeps a long word on its own line', () => {
    expect(wrapText('short averyveryverylongword end', 10)).toEqual([
      'short',
      'averyveryverylongword',
      'end',
    ]);
  });

  it('returns nothing for empty text', () => {
    expect(wrapText('', 10)).toEqual([]);
  });
});
