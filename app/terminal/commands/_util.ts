import type { FsNode } from '../fs/types'
import type { CommandContext, Writer } from '../types'
import { fsErrorMessage, isFsError } from '../fs/errors'

export { splitLines } from '../io/text'

export function reportFsError(ctx: CommandContext, err: unknown, code = 1): number {
  if (!isFsError(err))
    throw err
  ctx.stderr.line(fsErrorMessage(ctx.argv0, err))
  return code
}

export function printUsage(ctx: CommandContext, code = 1): number {
  ctx.stderr.line(`usage: ${ctx.registry.get(ctx.argv0)?.usage ?? ctx.argv0}`)
  return code
}

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

export function readInput(ctx: CommandContext, paths: string[]): string | null {
  if (paths.length === 0) {
    if (ctx.stdin === null) {
      printUsage(ctx)
      return null
    }
    return ctx.stdin
  }
  const chunks: string[] = []
  for (const path of paths) {
    try {
      chunks.push(ctx.fs.readFile(path, { sudo: ctx.sudo }))
    }
    catch (err) {
      reportFsError(ctx, err)
      return null
    }
  }
  return chunks.join('\n')
}

export function parseCount(value: string | undefined, fallback: number): number {
  if (value === undefined)
    return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export function writeLink(out: Writer, label: string, text: string, href: string): void {
  out.write(label)
  out.link(text, href)
  out.line()
}

export function visibleCommands(ctx: Pick<CommandContext, 'registry'>): string[] {
  return ctx.registry.list().filter(command => !command.hidden).map(command => command.name)
}
