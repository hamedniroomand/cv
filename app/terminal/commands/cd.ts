import type { Command } from '~/terminal/types'
import { navigateFor, reportFsError } from './_util'

export default {
  name: 'cd',
  description: 'Change the working directory',
  usage: 'cd [path]',
  complete: (argv, ctx) => ctx.fs.complete(argv[argv.length - 1] ?? '', { dirsOnly: true }),
  run(argv, ctx) {
    try {
      ctx.fs.chdir(argv[0] ?? '~')
    }
    catch (err) {
      return reportFsError(ctx, err)
    }
    navigateFor(ctx, '.')
    return 0
  },
} satisfies Command
