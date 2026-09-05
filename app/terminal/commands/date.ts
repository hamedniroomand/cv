import type { Command } from '~/terminal/types';

export default {
  name: 'date',
  description: 'Print the current date and time',
  usage: 'date',
  run(_argv, ctx) {
    ctx.stdout.line(new Date().toString());
    return 0;
  },
} satisfies Command;
