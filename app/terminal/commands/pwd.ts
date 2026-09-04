import type { Command } from '~/terminal/types'

export default {
  name: 'pwd',
  description: 'Print the working directory',
  usage: 'pwd',
  run(_argv, ctx) {
    ctx.stdout.line(ctx.fs.cwd)
    return 0
  },
} satisfies Command
