import type { Command, CommandContext, Span } from '../types'
import { isFsError } from '../fs/errors'
import { parseFlags } from '../shell/flags'
import { reportFsError, splitLines } from './_util'

function toRegex(pattern: string, ignoreCase: boolean): RegExp {
  const flags = ignoreCase ? 'gi' : 'g'
  try {
    return new RegExp(pattern, flags)
  }
  catch {
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
  }
}

function highlight(line: string, re: RegExp): Span[] {
  const spans: Span[] = []
  let last = 0
  re.lastIndex = 0
  for (const m of line.matchAll(re)) {
    if (m[0].length === 0)
      continue
    if (m.index > last)
      spans.push({ text: line.slice(last, m.index) })
    spans.push({ text: m[0], style: 'accent' })
    last = m.index + m[0].length
  }
  if (last < line.length)
    spans.push({ text: line.slice(last) })
  return spans
}

interface Source {
  label: string | null
  text: string
}

function collectSources(ctx: CommandContext, paths: string[], recursive: boolean): Source[] | null {
  if (paths.length === 0) {
    if (ctx.stdin === null) {
      ctx.stderr.line('usage: grep [-ri] <pattern> [path...]')
      return null
    }
    return [{ label: null, text: ctx.stdin }]
  }
  const sources: Source[] = []
  for (const path of paths) {
    let node
    try {
      node = ctx.fs.stat(path)
    }
    catch (err) {
      reportFsError(ctx, err, 2)
      continue
    }
    if (node.type === 'dir') {
      if (!recursive) {
        ctx.stderr.line(`grep: ${path}: Is a directory`)
        continue
      }
      const base = ctx.fs.resolve(path)
      ctx.fs.walk(path, (abs, n) => {
        if (n.type !== 'file' || abs.split('/').some(seg => seg.startsWith('.')))
          return
        try {
          const rel = abs.slice(base.length + 1)
          const label = path === '.' ? rel : `${path.replace(/\/$/, '')}/${rel}`
          sources.push({ label, text: ctx.fs.readFile(abs, { sudo: ctx.sudo }) })
        }
        catch (err) {
          if (!isFsError(err))
            throw err
        }
      })
      continue
    }
    try {
      sources.push({ label: path, text: ctx.fs.readFile(path, { sudo: ctx.sudo }) })
    }
    catch (err) {
      reportFsError(ctx, err, 2)
    }
  }
  return sources
}

export default {
  name: 'grep',
  description: 'Search for a pattern in files or stdin',
  usage: 'grep [-ric] <pattern> [path...]',
  run(argv, ctx) {
    const { flags, positionals } = parseFlags(argv, { boolean: ['r', 'i', 'c', 'n'] })
    const pattern = positionals[0]
    if (pattern === undefined) {
      ctx.stderr.line('usage: grep [-ri] <pattern> [path...]')
      return 2
    }
    const sources = collectSources(ctx, positionals.slice(1), flags.has('r'))
    if (sources === null)
      return 2

    const re = toRegex(pattern, flags.has('i'))
    const showLabels = sources.length > 1 || flags.has('r')
    let matches = 0
    for (const src of sources) {
      let count = 0
      splitLines(src.text).forEach((line, i) => {
        re.lastIndex = 0
        if (!re.test(line))
          return
        count++
        matches++
        if (flags.has('c'))
          return
        if (showLabels && src.label !== null)
          ctx.stdout.write(`${src.label}:`, 'dim')
        if (flags.has('n'))
          ctx.stdout.write(`${i + 1}:`, 'dim')
        ctx.stdout.raw(highlight(line, re))
        ctx.stdout.line()
      })
      if (flags.has('c'))
        ctx.stdout.line(showLabels && src.label !== null ? `${src.label}:${count}` : String(count))
    }
    return matches > 0 ? 0 : 1
  },
} satisfies Command
