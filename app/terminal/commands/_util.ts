import type { FsNode } from '../fs/types'
import type { CommandContext } from '../types'
import { fsErrorMessage, isFsError } from '../fs/errors'

/** Print `cmd: path: reason` for filesystem errors, rethrow anything else. Returns the exit code to use. */
export function reportFsError(ctx: CommandContext, err: unknown, code = 1): number {
  if (!isFsError(err))
    throw err
  ctx.stderr.line(fsErrorMessage(ctx.argv0, err))
  return code
}

/** Navigate the panel to whatever the node at `path` represents, if anything. */
export function navigateFor(ctx: CommandContext, path: string): void {
  let node: FsNode
  try {
    node = ctx.fs.stat(path)
  }
  catch {
    return
  }
  if (node.panel)
    ctx.panel.navigate(node.panel)
}

/**
 * Text input for filter-style commands: the named files, or stdin when no file is given.
 * Returns null after printing usage/errors when there is nothing to read.
 */
export function readInput(ctx: CommandContext, paths: string[]): string | null {
  if (paths.length === 0) {
    if (ctx.stdin === null) {
      ctx.stderr.line(`usage: ${ctx.registry.get(ctx.argv0)?.usage ?? ctx.argv0}`)
      return null
    }
    return ctx.stdin
  }
  const chunks: string[] = []
  for (const p of paths) {
    try {
      chunks.push(ctx.fs.readFile(p, { sudo: ctx.sudo }))
    }
    catch (err) {
      reportFsError(ctx, err)
      return null
    }
  }
  return chunks.join('\n')
}

/** Split text into lines, dropping the trailing empty line produced by a final newline. */
export function splitLines(text: string): string[] {
  const lines = text.split('\n')
  if (lines[lines.length - 1] === '')
    lines.pop()
  return lines
}

export function parseCount(value: string | undefined, fallback: number): number {
  if (value === undefined)
    return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}
