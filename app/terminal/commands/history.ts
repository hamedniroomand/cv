import type { Command } from '~/terminal/types'

export default {
  name: 'history',
  description: 'Show command history',
  usage: 'history',
  run(_argv, ctx) {
    ctx.history.forEach((line, index) => {
      ctx.stdout.write(`${String(index + 1).padStart(4)}  `, 'dim')
      ctx.stdout.line(line)
    })
    return 0
  },
} satisfies Command
