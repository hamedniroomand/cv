import type { Command, CommandContext } from '~/terminal/types'
import { renderMarkdown } from '~/terminal/io/markdown'
import { ensureNewline } from '~/terminal/io/text'
import { navigateFor, printUsage, reportFsError } from './_util'

function printMarkdown(ctx: CommandContext, path: string, content: string): void {
  ctx.stdout.line(`── ${ctx.fs.display(ctx.fs.resolve(path))}`, 'dim')
  for (const spans of renderMarkdown(content)) {
    ctx.stdout.raw(spans)
    ctx.stdout.line()
  }
}

export default {
  name: 'bat',
  description: 'Print a file with markdown rendered',
  usage: 'bat <file>...',
  run(argv, ctx) {
    if (argv.length === 0)
      return printUsage(ctx)
    let code = 0
    argv.forEach((path, index) => {
      let content: string
      try {
        content = ctx.fs.readFile(path, { sudo: ctx.sudo })
      }
      catch (err) {
        code = reportFsError(ctx, err)
        return
      }
      if (index === 0)
        navigateFor(ctx, path)
      if (path.endsWith('.md'))
        printMarkdown(ctx, path, content)
      else
        ctx.stdout.write(ensureNewline(content))
    })
    return code
  },
} satisfies Command
