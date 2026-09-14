import { byteLength } from '~/terminal/io/text';
import { parseFlags } from '~/terminal/shell/flags';
import type { Command, CommandContext } from '~/terminal/types';

import { forEachFile, printUsage } from './_util';

interface Counts {
  lines: number;
  words: number;
  bytes: number;
}

type CountKey = keyof Counts;

const ALL_COUNTS: CountKey[] = ['lines', 'words', 'bytes'];
const COUNT_FLAGS: Record<CountKey, string> = { lines: 'l', words: 'w', bytes: 'c' };
const ZERO: Counts = { lines: 0, words: 0, bytes: 0 };

function count(text: string): Counts {
  const trimmed = text.trim();
  return {
    lines: text.match(/\n/g)?.length ?? 0,
    words: trimmed === '' ? 0 : trimmed.split(/\s+/).length,
    bytes: byteLength(text),
  };
}

function add(left: Counts, right: Counts): Counts {
  return {
    lines: left.lines + right.lines,
    words: left.words + right.words,
    bytes: left.bytes + right.bytes,
  };
}

function format(counts: Counts, selected: CountKey[], label?: string): string {
  const values = selected.map(key => counts[key]);
  const numbers =
    values.length === 1
      ? String(values[0])
      : values.map(value => String(value).padStart(7)).join(' ');
  return label ? `${numbers} ${label}` : numbers;
}

function countFiles(ctx: CommandContext, paths: string[], selected: CountKey[]): number {
  let total = ZERO;
  let successes = 0;
  const code = forEachFile(ctx, paths, (path, text) => {
    const counts = count(text);
    ctx.stdout.line(format(counts, selected, path));
    total = add(total, counts);
    successes++;
  });
  if (paths.length > 1 && successes > 0) ctx.stdout.line(format(total, selected, 'total'));
  return code;
}

export default {
  name: 'wc',
  description: 'Count lines, words, and bytes',
  usage: 'wc [-lwc] [file...]',
  run(argv, ctx) {
    const { flags, positionals, unknown } = parseFlags(argv, {
      boolean: Object.values(COUNT_FLAGS),
    });
    if (unknown.length > 0) return printUsage(ctx);
    const selected =
      flags.size === 0 ? ALL_COUNTS : ALL_COUNTS.filter(key => flags.has(COUNT_FLAGS[key]));
    if (positionals.length > 0) return countFiles(ctx, positionals, selected);
    if (ctx.stdin === null) return printUsage(ctx);
    ctx.stdout.line(format(count(ctx.stdin), selected));
    return 0;
  },
} satisfies Command;
