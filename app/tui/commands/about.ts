import type { AppCommand } from '../types'
import { printMarkdown } from '../markdown'

export default {
  name: 'about',
  description: 'Read the profile summary',
  run(_argv, ctx) {
    printMarkdown(ctx.view, ctx.fs.readFile('~/about.md'))
    ctx.panel.navigate({ section: 'about' })
    return 0
  },
} satisfies AppCommand
