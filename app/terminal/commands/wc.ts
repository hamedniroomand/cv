import type { Command, CommandContext } from '../types'
import { parseFlags } from '../shell/flags'
import { reportFsError, splitLines } from './_util'

interface Counts {
  lines: number
  words: number
  bytes: number
}

function count(text: string): Counts {
  return {
    lines: splitLines(text).length,
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    bytes: new TextEncoder().encode(text).length,
  }
}

function format(counts: Counts, selected: (keyof Counts)[], label?: string): string {
  const values = selected.map(key => counts[key])
  const numbers = values.length === 1
    ? String(values[0])
    : values.map(value => String(value).padStart(7)).join(' ')
  return label ? `${numbers} ${label}` : numbers
}

function add(left: Counts, right: Counts): Counts {
  return {
    lines: left.lines + right.lines,
    words: left.words + right.words,
    bytes: left.bytes + right.bytes,
  }
}

function selectedCounts(flags: Set<string>): (keyof Counts)[] {
  if (flags.size === 0)
    return ['lines', 'words', 'bytes']
  const selected: (keyof Counts)[] = []
  if (flags.has('l'))
    selected.push('lines')
  if (flags.has('w'))
    selected.push('words')
  if (flags.has('c'))
    selected.push('bytes')
  return selected
}

function countFiles(ctx: CommandContext, paths: string[], selected: (keyof Counts)[]): number {
  let code = 0
  let successes = 0
  let total: Counts = { lines: 0, words: 0, bytes: 0 }
  for (const path of paths) {
    try {
      const counts = count(ctx.fs.readFile(path, { sudo: ctx.sudo }))
      ctx.stdout.line(format(counts, selected, path))
      total = add(total, counts)
      successes++
    }
    catch (err) {
      code = reportFsError(ctx, err)
    }
  }
  if (paths.length > 1 && successes > 0)
    ctx.stdout.line(format(total, selected, 'total'))
  return code
}

export default {
  name: 'wc',
  description: 'Count lines, words, and bytes',
  usage: 'wc [-lwc] [file...]',
  run(argv, ctx) {
    const { flags, positionals, unknown } = parseFlags(argv, { boolean: ['l', 'w', 'c'] })
    if (unknown.length > 0) {
      ctx.stderr.line('usage: wc [-lwc] [file...]')
      return 1
    }
    const selected = selectedCounts(flags)
    if (positionals.length > 0)
      return countFiles(ctx, positionals, selected)
    if (ctx.stdin === null) {
      ctx.stderr.line('usage: wc [-lwc] [file...]')
      return 1
    }
    ctx.stdout.line(format(count(ctx.stdin), selected))
    return 0
  },
} satisfies Command
