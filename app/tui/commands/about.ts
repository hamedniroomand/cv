import { openInPanel } from '~/tui/panel';
import type { AppCommand } from '~/tui/types';

export default {
  name: 'about',
  description: 'Open the profile summary',
  run(_argv, ctx) {
    openInPanel(ctx, 'About', { section: 'about' }, 'bat ~/about.md');
    return 0;
  },
} satisfies AppCommand;
