import type { AppCommand } from '../types'

export default {
  name: 'contact',
  description: 'Show contact links and message form',
  run: (_argv, ctx) => ctx.shell('contact'),
} satisfies AppCommand
