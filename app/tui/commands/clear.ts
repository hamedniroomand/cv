import type { AppCommand } from '../types'

export default {
  name: 'clear',
  description: 'Clear the app content',
  run(_argv, ctx) {
    ctx.view.clear()
    return 0
  },
} satisfies AppCommand
