import type { AppCommand } from '~/tui/types'
import { printMarkdown } from '~/tui/markdown'

export default {
  name: 'about',
  description: 'Read the profile summary',
  run(_argv, ctx) {
    printMarkdown(ctx.view, ctx.fs.readFile('~/about.md'))
    ctx.panel.navigate({ section: 'about' })
    return 0
  },
} satisfies AppCommand
