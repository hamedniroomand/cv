import type { Command } from '../types'
import { parseFlags } from '../shell/flags'
import { parseCount, readInput, splitLines } from './_util'

export default {
  name: 'tail',
  description: 'Print the last lines of input',
  usage: 'tail [-n N] [file]',
  run(argv, ctx) {
    const { values, positionals } = parseFlags(argv, { string: ['n'] })
    const text = readInput(ctx, positionals)
    if (text === null)
      return 1
    const n = parseCount(values.n, 10)
    const lines = splitLines(text)
    for (const line of n === 0 ? [] : lines.slice(-n))
      ctx.stdout.line(line)
    return 0
  },
} satisfies Command
