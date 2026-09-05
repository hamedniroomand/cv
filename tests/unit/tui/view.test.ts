import { describe, expect, it } from 'vite-plus/test';

import type { OutputLine } from '~/terminal/types';
import { createPrinter } from '~/tui/view';

function setup() {
  const lines: OutputLine[] = [];
  let id = 0;
  return {
    lines,
    print: createPrinter(
      line => lines.push(line),
      () => ++id,
    ),
  };
}

describe('createPrinter', () => {
  it('prints a styled string as one line', () => {
    const { lines, print } = setup();
    print('hello', 'error');
    expect(lines).toEqual([{ id: 1, spans: [{ text: 'hello', style: 'error' }] }]);
  });

  it('prints an empty string or empty spans as a blank line', () => {
    const { lines, print } = setup();
    print('');
    print([]);
    expect(lines).toEqual([
      { id: 1, spans: [] },
      { id: 2, spans: [] },
    ]);
  });

  it('prints spans as given', () => {
    const { lines, print } = setup();
    print([{ text: 'a' }, { text: 'b', style: 'accent', href: 'https://x' }]);
    expect(lines[0]!.spans).toEqual([
      { text: 'a' },
      { text: 'b', style: 'accent', href: 'https://x' },
    ]);
  });
});
