import type { Command } from '~/terminal/types';
import { APP_COMMAND } from '~/tui/types';

export default {
  name: APP_COMMAND,
  aliases: ['app', 'tui'],
  description: 'Open the interactive menu',
  usage: APP_COMMAND,
  async run(_argv, ctx) {
    await ctx.ui.openApp();
    ctx.stdout.line(`${APP_COMMAND}: exited`);
    return 0;
  },
} satisfies Command;
