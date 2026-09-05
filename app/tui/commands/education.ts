import { openInPanel } from '~/tui/panel';
import type { AppCommand } from '~/tui/types';

export default {
  name: 'education',
  description: 'Open education details',
  run(_argv, ctx) {
    openInPanel(ctx, 'Education', { section: 'education' }, 'bat ~/education.md');
    return 0;
  },
} satisfies AppCommand;
