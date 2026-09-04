import type { AppCommand } from '../types'

export default {
  name: 'exit',
  aliases: ['quit', 'q'],
  description: 'Leave the app',
  run(_argv, ctx) {
    ctx.view.exit()
    return 0
  },
} satisfies AppCommand
