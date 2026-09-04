import type { Command } from '../types'
import { navigateFor, reportFsError } from './_util'

export default {
  name: 'cd',
  description: 'Change the working directory',
  usage: 'cd [path]',
  complete: (argv, ctx) => ctx.fs.complete(argv[argv.length - 1] ?? '', { dirsOnly: true }),
  run(argv, ctx) {
    const target = argv[0] ?? '~'
    try {
      ctx.fs.chdir(target)
    }
    catch (err) {
      return reportFsError(ctx, err)
    }
    navigateFor(ctx, '.')
    return 0
  },
} satisfies Command
