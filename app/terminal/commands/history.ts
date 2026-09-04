import type { Command } from '../types'

export default {
  name: 'history',
  description: 'Show command history',
  usage: 'history',
  run(_argv, ctx) {
    ctx.history.forEach((line, i) => {
      ctx.stdout.write(`${String(i + 1).padStart(4)}  `, 'dim')
      ctx.stdout.line(line)
    })
    return 0
  },
} satisfies Command
