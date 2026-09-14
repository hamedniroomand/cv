import { renderMarkdown } from '~/terminal/io/markdown';
import { ensureNewline } from '~/terminal/io/text';
import type { Command, CommandContext } from '~/terminal/types';

import { forEachFile, navigateFor, printUsage } from './_util';

function printMarkdown(ctx: CommandContext, path: string, content: string): void {
  ctx.stdout.line(`── ${ctx.fs.display(ctx.fs.resolve(path))}`, 'dim');
  for (const spans of renderMarkdown(content)) {
    ctx.stdout.raw(spans);
    ctx.stdout.line();
  }
}

export default {
  name: 'bat',
  description: 'Print a file with markdown rendered',
  usage: 'bat <file>...',
  run(argv, ctx) {
    if (argv.length === 0) return printUsage(ctx);
    return forEachFile(ctx, argv, (path, content, index) => {
      if (index === 0) navigateFor(ctx, path);
      if (path.endsWith('.md')) printMarkdown(ctx, path, content);
      else ctx.stdout.write(ensureNewline(content));
    });
  },
} satisfies Command;
