import type { Command } from '../types'
import { openEditor } from './_editor'

export default {
  name: 'nano',
  hidden: true,
  description: 'Open a file in a read-only nano',
  usage: 'nano <file>',
  run: (argv, ctx) => openEditor('nano', argv, ctx),
} satisfies Command
