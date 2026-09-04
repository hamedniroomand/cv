import type { Command } from '../types'
import { navigateFor, reportFsError } from './_util'

export default {
  name: 'cat',
  description: 'Print file contents',
  usage: 'cat <file>...',
  run(argv, ctx) {
    if (argv.length === 0) {
      if (ctx.stdin === null) {
        ctx.stderr.line('usage: cat <file>...')
        return 1
      }
      ctx.stdout.write(ctx.stdin)
      return 0
    }
    let code = 0
    argv.forEach((path, i) => {
      try {
        const content = ctx.fs.readFile(path, { sudo: ctx.sudo })
        ctx.stdout.write(content.endsWith('\n') ? content : `${content}\n`)
        if (i === 0)
          navigateFor(ctx, path)
      }
      catch (err) {
        code = reportFsError(ctx, err)
      }
    })
    return code
  },
} satisfies Command
