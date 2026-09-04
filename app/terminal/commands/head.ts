import type { Command } from '../types'
import { splitLines } from '../io/text'
import { parseFlags } from '../shell/flags'
import { parseCount, readInput } from './_util'

export default {
  name: 'head',
  description: 'Print the first lines of input',
  usage: 'head [-n N] [file]',
  run(argv, ctx) {
    const { values, positionals } = parseFlags(argv, { string: ['n'] })
    const text = readInput(ctx, positionals)
    if (text === null)
      return 1
    for (const line of splitLines(text).slice(0, parseCount(values.n, 10)))
      ctx.stdout.line(line)
    return 0
  },
} satisfies Command
