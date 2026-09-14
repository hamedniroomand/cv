import { ensureNewline } from '~/terminal/io/text';
import type { Command } from '~/terminal/types';

import { forEachFile, navigateFor, printUsage } from './_util';

export default {
  name: 'cat',
  description: 'Print file contents',
  usage: 'cat <file>...',
  run(argv, ctx) {
    if (argv.length === 0) {
      if (ctx.stdin === null) return printUsage(ctx);
      ctx.stdout.write(ctx.stdin);
      return 0;
    }
    return forEachFile(ctx, argv, (path, content, index) => {
      ctx.stdout.write(ensureNewline(content));
      if (index === 0) navigateFor(ctx, path);
      if (ctx.tty && path.endsWith('.md'))
        ctx.stdout.line(`tip: bat ${path} renders this as formatted text`, 'dim');
    });
  },
} satisfies Command;
