import type { Json } from '~/terminal/jq/eval';
import { evalJq, formatJson, JqRuntimeError } from '~/terminal/jq/eval';
import { JqSyntaxError, parseJq } from '~/terminal/jq/parse';
import { parseFlags } from '~/terminal/shell/flags';
import type { Command, CommandContext } from '~/terminal/types';

import { printUsage, reportFsError } from './_util';

const EXIT_USAGE = 2;
const EXIT_FILTER = 3;

function reportError(ctx: CommandContext, err: unknown): number {
  if (err instanceof JqSyntaxError || err instanceof JqRuntimeError) {
    ctx.stderr.line(`jq: error: ${err.message}`);
    return EXIT_FILTER;
  }
  if (err instanceof SyntaxError) {
    ctx.stderr.line(`jq: parse error: ${err.message}`);
    return EXIT_USAGE;
  }
  return reportFsError(ctx, err);
}

export default {
  name: 'jq',
  description: 'Filter JSON data',
  usage: 'jq [-rc] <filter> [file]',
  run(argv, ctx) {
    const { flags, positionals, unknown } = parseFlags(argv, { boolean: ['r', 'c'] });
    const [filter, file, extra] = positionals;
    if (unknown.length > 0 || filter === undefined || extra !== undefined)
      return printUsage(ctx, EXIT_USAGE);
    try {
      const node = parseJq(filter);
      const text = file === undefined ? ctx.stdin : ctx.fs.readFile(file, { sudo: ctx.sudo });
      if (text === null) return printUsage(ctx, EXIT_USAGE);
      const input = JSON.parse(text) as Json;
      for (const output of evalJq(node, input))
        ctx.stdout.line(formatJson(output, { raw: flags.has('r'), compact: flags.has('c') }));
      return 0;
    } catch (err) {
      return reportError(ctx, err);
    }
  },
} satisfies Command;
