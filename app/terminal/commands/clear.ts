import type { Command } from '../types'

export default {
  name: 'clear',
  aliases: ['cls'],
  description: 'Clear the screen',
  usage: 'clear',
  run(_argv, ctx) {
    ctx.ui.clear()
    return 0
  },
} satisfies Command
