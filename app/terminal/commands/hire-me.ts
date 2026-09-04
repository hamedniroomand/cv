import type { Command } from '../types'

export default {
  name: 'hire-me',
  hidden: true,
  description: 'Open the offer form',
  usage: 'sudo hire-me',
  async run(_argv, ctx) {
    if (!ctx.sudo) {
      ctx.stderr.line('hire-me: permission denied. Try: sudo hire-me')
      return 1
    }
    await ctx.ui.openModal('hire')
    return 0
  },
} satisfies Command
