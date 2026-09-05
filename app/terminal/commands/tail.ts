import { splitLines } from '~/terminal/io/text';
import { parseFlags } from '~/terminal/shell/flags';
import type { Command } from '~/terminal/types';

import { parseCount, readInput } from './_util';

export default {
  name: 'tail',
  description: 'Print the last lines of input',
  usage: 'tail [-n N] [file]',
  run(argv, ctx) {
    const { values, positionals } = parseFlags(argv, { string: ['n'] });
    const text = readInput(ctx, positionals);
    if (text === null) return 1;
    const count = parseCount(values.n, 10);
    const lines = count === 0 ? [] : splitLines(text).slice(-count);
    for (const line of lines) ctx.stdout.line(line);
    return 0;
  },
} satisfies Command;
