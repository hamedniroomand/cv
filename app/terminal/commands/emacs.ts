import type { Command } from '../types'

export default {
  name: 'emacs',
  hidden: true,
  description: 'Start the other editor',
  usage: 'emacs [file]',
  run(_argv, ctx) {
    ctx.stdout.line('Not on my machine.')
    return 1
  },
} satisfies Command
