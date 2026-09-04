import type { Command } from '../types'
import { renderMarkdown } from '../io/markdown'
import { navigateFor, reportFsError } from './_util'

export default {
  name: 'bat',
  description: 'Print a file with markdown rendered',
  usage: 'bat <file>...',
  run(argv, ctx) {
    if (argv.length === 0) {
      ctx.stderr.line('usage: bat <file>...')
      return 1
    }
    let code = 0
    argv.forEach((path, i) => {
      let content: string
      try {
        content = ctx.fs.readFile(path, { sudo: ctx.sudo })
      }
      catch (err) {
        code = reportFsError(ctx, err)
        return
      }
      if (i === 0)
        navigateFor(ctx, path)
      if (!path.endsWith('.md')) {
        ctx.stdout.write(content.endsWith('\n') ? content : `${content}\n`)
        return
      }
      ctx.stdout.line(`── ${ctx.fs.display(ctx.fs.resolve(path))}`, 'dim')
      for (const spans of renderMarkdown(content)) {
        ctx.stdout.raw(spans)
        ctx.stdout.line()
      }
    })
    return code
  },
} satisfies Command
