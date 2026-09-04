import type { CompletionContext } from '../types'

export interface CompletionResult {
  /** The line after completion (unchanged when there is not exactly one candidate). */
  line: string
  candidates: string[]
}

/** Split leniently on whitespace, keeping a trailing empty word when the line ends with a space. */
function words(text: string): string[] {
  const parts = text.split(/\s+/).filter(Boolean)
  if (text.length === 0 || /\s$/.test(text))
    parts.push('')
  return parts
}

function longestCommonPrefix(items: string[]): string {
  if (items.length === 0)
    return ''
  let prefix = items[0]!
  for (const item of items.slice(1)) {
    while (!item.startsWith(prefix))
      prefix = prefix.slice(0, -1)
  }
  return prefix
}

/** Tab completion for the current command line. */
export function completeLine(line: string, ctx: CompletionContext): CompletionResult {
  const pipeIndex = line.lastIndexOf('|')
  const head = pipeIndex >= 0 ? line.slice(0, pipeIndex + 1) : ''
  const segment = pipeIndex >= 0 ? line.slice(pipeIndex + 1) : line
  const argv = words(segment)
  const current = argv[argv.length - 1] ?? ''
  const before = segment.slice(0, segment.length - current.length)

  let candidates: string[]
  let trailing = (c: string) => (c.endsWith('/') ? '' : ' ')

  if (argv.length <= 1) {
    candidates = ctx.registry.list().filter(c => !c.hidden).map(c => c.name).filter(n => n.startsWith(current))
    trailing = () => ' '
  }
  else {
    const command = ctx.registry.get(argv[0]!)
    if (!command)
      return { line, candidates: [] }
    candidates = command.complete
      ? command.complete(argv.slice(1), ctx).filter(c => c.startsWith(current))
      : ctx.fs.complete(current)
  }
  candidates = [...new Set(candidates)].sort()

  if (candidates.length === 1)
    return { line: `${head}${before}${candidates[0]}${trailing(candidates[0]!)}`, candidates }
  if (candidates.length > 1) {
    const common = longestCommonPrefix(candidates)
    if (common.length > current.length)
      return { line: `${head}${before}${common}`, candidates }
  }
  return { line, candidates }
}
