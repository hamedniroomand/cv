import type { AppCommand } from '~/tui/types'
import { printMarkdown } from '~/tui/markdown'

export default {
  name: 'education',
  description: 'Read education details',
  run(_argv, ctx) {
    printMarkdown(ctx.view, ctx.fs.readFile('~/education.md'))
    ctx.panel.navigate({ section: 'education' })
    return 0
  },
} satisfies AppCommand
