import type { AppCommand } from '../types'

export default {
  name: 'education',
  description: 'Read education details',
  run(_argv, ctx) {
    ctx.view.print(ctx.fs.readFile('~/education.md'))
    ctx.panel.navigate({ section: 'education' })
    return 0
  },
} satisfies AppCommand
