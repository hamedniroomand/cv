import type { Command, CommandContext, Span } from '../types'
import { isFsError } from '../fs/errors'
import { splitLines } from '../io/text'
import { parseFlags } from '../shell/flags'
import { reportFsError } from './_util'

const USAGE = 'usage: grep [-ri] <pattern> [path...]'
const EXIT_USAGE = 2

interface Source {
  label: string | null
  text: string
}

interface GrepOptions {
  regex: RegExp
  countOnly: boolean
  numbered: boolean
  showLabels: boolean
}

function escapeRegex(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toRegex(pattern: string, ignoreCase: boolean): RegExp {
  const flags = ignoreCase ? 'gi' : 'g'
  try {
    return new RegExp(pattern, flags)
  }
  catch {
    return new RegExp(escapeRegex(pattern), flags)
  }
}

function highlight(line: string, regex: RegExp): Span[] {
  const spans: Span[] = []
  let last = 0
  regex.lastIndex = 0
  for (const match of line.matchAll(regex)) {
    if (match[0].length === 0)
      continue
    if (match.index > last)
      spans.push({ text: line.slice(last, match.index) })
    spans.push({ text: match[0], style: 'accent' })
    last = match.index + match[0].length
  }
  if (last < line.length)
    spans.push({ text: line.slice(last) })
  return spans
}

function isHiddenPath(abs: string): boolean {
  return abs.split('/').some(segment => segment.startsWith('.'))
}

function directorySources(ctx: CommandContext, path: string): Source[] {
  const base = ctx.fs.resolve(path)
  const prefix = path === '.' ? '' : `${path.replace(/\/$/, '')}/`
  const sources: Source[] = []
  ctx.fs.walk(path, (abs, node) => {
    if (node.type !== 'file' || isHiddenPath(abs))
      return
    try {
      sources.push({ label: `${prefix}${abs.slice(base.length + 1)}`, text: ctx.fs.readFile(abs, { sudo: ctx.sudo }) })
    }
    catch (err) {
      if (!isFsError(err))
        throw err
    }
  })
  return sources
}

function pathSources(ctx: CommandContext, path: string, recursive: boolean): Source[] {
  try {
    const node = ctx.fs.stat(path)
    if (node.type === 'file')
      return [{ label: path, text: ctx.fs.readFile(path, { sudo: ctx.sudo }) }]
    if (recursive)
      return directorySources(ctx, path)
    ctx.stderr.line(`grep: ${path}: Is a directory`)
    return []
  }
  catch (err) {
    reportFsError(ctx, err, EXIT_USAGE)
    return []
  }
}

function collectSources(ctx: CommandContext, paths: string[], recursive: boolean): Source[] | null {
  if (paths.length > 0)
    return paths.flatMap(path => pathSources(ctx, path, recursive))
  if (ctx.stdin === null) {
    ctx.stderr.line(USAGE)
    return null
  }
  return [{ label: null, text: ctx.stdin }]
}

function labelFor(source: Source, opts: GrepOptions): string | null {
  return opts.showLabels && source.label !== null ? source.label : null
}

function grepSource(ctx: CommandContext, source: Source, opts: GrepOptions): number {
  const label = labelFor(source, opts)
  let count = 0
  splitLines(source.text).forEach((line, index) => {
    opts.regex.lastIndex = 0
    if (!opts.regex.test(line))
      return
    count++
    if (opts.countOnly)
      return
    if (label !== null)
      ctx.stdout.write(`${label}:`, 'dim')
    if (opts.numbered)
      ctx.stdout.write(`${index + 1}:`, 'dim')
    ctx.stdout.raw(highlight(line, opts.regex))
    ctx.stdout.line()
  })
  if (opts.countOnly)
    ctx.stdout.line(label !== null ? `${label}:${count}` : String(count))
  return count
}

export default {
  name: 'grep',
  description: 'Search for a pattern in files or stdin',
  usage: 'grep [-ric] <pattern> [path...]',
  run(argv, ctx) {
    const { flags, positionals } = parseFlags(argv, { boolean: ['r', 'i', 'c', 'n'] })
    const [pattern, ...paths] = positionals
    if (pattern === undefined) {
      ctx.stderr.line(USAGE)
      return EXIT_USAGE
    }
    const recursive = flags.has('r')
    const sources = collectSources(ctx, paths, recursive)
    if (sources === null)
      return EXIT_USAGE

    const opts: GrepOptions = {
      regex: toRegex(pattern, flags.has('i')),
      countOnly: flags.has('c'),
      numbered: flags.has('n'),
      showLabels: sources.length > 1 || recursive,
    }
    const matches = sources.reduce((total, source) => total + grepSource(ctx, source, opts), 0)
    return matches > 0 ? 0 : 1
  },
} satisfies Command
