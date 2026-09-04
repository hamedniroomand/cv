import type { AppCommand } from '../types'

export default {
  name: 'about',
  description: 'Read the profile summary',
  run(_argv, ctx) {
    ctx.view.print(ctx.fs.readFile('~/about.md'))
    ctx.panel.navigate({ section: 'about' })
    return 0
  },
} satisfies AppCommand
