import type { AppCommand } from '~/tui/types'

export default {
  name: 'exit',
  aliases: ['quit', 'q'],
  description: 'Leave the app',
  run(_argv, ctx) {
    ctx.view.exit()
    return 0
  },
} satisfies AppCommand
