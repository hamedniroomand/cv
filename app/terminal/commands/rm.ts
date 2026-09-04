import type { Command } from '../types'

/** Targets that mean "take the whole thing down" when combined with -r and -f. */
const DOOMED = new Set(['/', '/*', '~'])

export default {
  name: 'rm',
  hidden: true,
  description: 'Remove files',
  usage: 'rm [-rf] <file>...',
  run(argv, ctx) {
    const isFlag = (arg: string) => arg.startsWith('-') && arg.length > 1
    const letters = new Set(argv.filter(isFlag).join('').replaceAll('-', ''))
    const operands = argv.filter(arg => !isFlag(arg))

    if (operands.length === 0) {
      ctx.stderr.line('usage: rm [-rf] <file>...')
      return 1
    }

    if (letters.has('r') && letters.has('f') && operands.length === 1 && DOOMED.has(operands[0]!)) {
      ctx.stdout.line('rm: it\'s your funeral.')
      ctx.ui.destroy()
      return 0
    }

    for (const operand of operands)
      ctx.stderr.line(`rm: cannot remove '${operand}': Read-only file system`)
    return 1
  },
} satisfies Command
