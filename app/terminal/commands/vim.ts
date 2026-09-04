import type { Command } from '../types'
import { openEditor } from './_editor'

export default {
  name: 'vim',
  hidden: true,
  description: 'Open a file in a read-only vim',
  usage: 'vim <file>',
  run: (argv, ctx) => openEditor('vim', argv, ctx),
} satisfies Command
