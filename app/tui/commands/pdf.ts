import type { AppCommand } from '~/tui/types';

export default {
  name: 'pdf',
  aliases: ['export'],
  description: 'Download the one-page PDF',
  run: (_argv, ctx) => ctx.shell('cv --pdf'),
} satisfies AppCommand;
