import type { Command } from '~/terminal/types';

export default {
  name: 'echo',
  description: 'Print arguments',
  usage: 'echo [text...]',
  run(argv, ctx) {
    ctx.stdout.line(argv.join(' '));
    return 0;
  },
} satisfies Command;
