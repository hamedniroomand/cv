import type { CommandContext } from '../types'
import { isFsError } from '../fs/errors'
import { reportFsError } from './_util'

export type EditorKind = 'vim' | 'nano'

/**
 * Shared body of `vim` and `nano`: read the file with `cat`'s permission rules,
 * then hand it to the editor modal. A missing file opens an empty buffer (`content: null`).
 */
export async function openEditor(kind: EditorKind, argv: string[], ctx: CommandContext): Promise<number> {
  const path = argv.find(arg => !arg.startsWith('-'))
  if (path === undefined) {
    ctx.stderr.line(`usage: ${kind} <file>`)
    return 1
  }

  let content: string | null = null
  try {
    content = ctx.fs.readFile(path, { sudo: ctx.sudo })
  }
  catch (err) {
    if (!isFsError(err) || err.code !== 'ENOENT')
      return reportFsError(ctx, err)
  }

  await ctx.ui.openModal('editor', { kind, path, content })
  return 0
}
