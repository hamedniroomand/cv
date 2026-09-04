import type { Command } from '../types'
import { ensureNewline } from '../io/text'
import { navigateFor, printUsage, reportFsError } from './_util'

export default {
  name: 'cat',
  description: 'Print file contents',
  usage: 'cat <file>...',
  run(argv, ctx) {
    if (argv.length === 0) {
      if (ctx.stdin === null)
        return printUsage(ctx)
      ctx.stdout.write(ctx.stdin)
      return 0
    }
    let code = 0
    argv.forEach((path, index) => {
      try {
        ctx.stdout.write(ensureNewline(ctx.fs.readFile(path, { sudo: ctx.sudo })))
        if (index === 0)
          navigateFor(ctx, path)
        if (ctx.tty && path.endsWith('.md'))
          ctx.stdout.line(`tip: bat ${path} renders this as formatted text`, 'dim')
      }
      catch (err) {
        code = reportFsError(ctx, err)
      }
    })
    return code
  },
} satisfies Command
