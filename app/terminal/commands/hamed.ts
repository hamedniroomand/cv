import type { Command } from '../types'

export default {
  name: 'hamed',
  aliases: ['app', 'tui'],
  description: 'Open the interactive app',
  usage: 'hamed',
  async run(_argv, ctx) {
    await ctx.ui.openApp()
    ctx.stdout.line('hamed: exited')
    return 0
  },
} satisfies Command
