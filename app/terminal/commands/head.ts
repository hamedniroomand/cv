import type { Command } from '../types'
import { parseFlags } from '../shell/flags'
import { parseCount, readInput, splitLines } from './_util'

export default {
  name: 'head',
  description: 'Print the first lines of input',
  usage: 'head [-n N] [file]',
  run(argv, ctx) {
    const { values, positionals } = parseFlags(argv, { string: ['n'] })
    const text = readInput(ctx, positionals)
    if (text === null)
      return 1
    const n = parseCount(values.n, 10)
    for (const line of splitLines(text).slice(0, n))
      ctx.stdout.line(line)
    return 0
  },
} satisfies Command
