import type { Span } from '../types'

const RULE: Span = { text: '────────', style: 'dim' }
const BULLET: Span = { text: '  • ', style: 'dim' }
const QUOTE: Span = { text: '│ ', style: 'dim' }
const DIAGRAM: Span = { text: '(mermaid diagram omitted)', style: 'dim' }

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ' }

/**
 * Reduce a line of inline HTML to markdown-ish text: `<hN>` → `#`, `<a href>` → `[text](href)`,
 * `<code>` → backticks, everything else stripped to its text. Returns '' for tag-only scaffolding.
 */
function htmlToText(line: string): string {
  const heading = /^<h([1-6])\b[^>]*>(.*)<\/h\1>$/i.exec(line)
  if (heading)
    return `${'#'.repeat(Number(heading[1]))} ${htmlToText(heading[2]!)}`
  return line
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_m, href: string, inner: string) => {
      const label = inner.replace(/<[^>]+>/g, '').trim()
      return label ? `[${label}](${href})` : ''
    })
    .replace(/<code\b[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|\w+);/g, (m, name: string) => name.startsWith('#') ? String.fromCodePoint(Number(name.slice(1))) : ENTITIES[name] ?? m)
    .trim()
}

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|(?<![\w*])[*_]([^*_]+)[*_](?![\w*])/g

/** Inline markdown (links, code, emphasis) to spans. Emphasis markers are dropped; there is no italic style. */
export function renderInline(text: string): Span[] {
  const spans: Span[] = []
  let last = 0
  const push = (span: Span) => {
    if (span.text.length > 0)
      spans.push(span)
  }
  for (const m of text.matchAll(INLINE)) {
    push({ text: text.slice(last, m.index) })
    const [, label, href, code, strong, em] = m
    if (href !== undefined)
      push({ text: label!, style: 'accent', href })
    else if (code !== undefined)
      push({ text: code, style: 'accent' })
    else if (strong !== undefined)
      push({ text: strong, style: 'accent' })
    else
      push({ text: em! })
    last = m.index + m[0].length
  }
  push({ text: text.slice(last) })
  return mergePlain(spans)
}

function mergePlain(spans: Span[]): Span[] {
  const out: Span[] = []
  for (const span of spans) {
    const prev = out[out.length - 1]
    if (prev && !prev.style && !prev.href && !span.style && !span.href)
      prev.text += span.text
    else
      out.push({ ...span })
  }
  return out
}

/** Render a markdown document to terminal lines. Line breaks are kept as-is; the view wraps long lines. */
export function renderMarkdown(source: string): Span[][] {
  const lines: Span[][] = []
  let fence: false | 'code' | 'mermaid' = false

  for (const raw of source.replace(/<br\s*\/?>/gi, '\n').split('\n')) {
    let line = raw.trimEnd()
    if (line.startsWith('```')) {
      if (fence) {
        fence = false
      }
      else {
        fence = /^```\s*mermaid\b/.test(line) ? 'mermaid' : 'code'
        if (fence === 'mermaid')
          lines.push([DIAGRAM])
      }
      continue
    }
    if (fence === 'mermaid')
      continue
    if (fence) {
      lines.push([{ text: raw, style: 'pre' }])
      continue
    }
    if (/<[a-z/!][^>]*>/i.test(line)) {
      line = htmlToText(line)
      if (line === '')
        continue
    }
    const heading = /^#{1,6} +(\S.*)$/.exec(line)
    const item = /^ *(?:[-*+]|\d+[.)]) +(\S.*)$/.exec(line)
    const quote = /^>\s?(.*)$/.exec(line)
    if (line === '') {
      if (lines.length > 0 && lines[lines.length - 1]!.length > 0)
        lines.push([])
    }
    else if (heading) {
      lines.push([{ text: heading[1]!, style: 'accent' }])
    }
    else if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)) {
      lines.push([RULE])
    }
    else if (item) {
      lines.push([BULLET, ...renderInline(item[1]!)])
    }
    else if (quote) {
      lines.push([QUOTE, ...renderInline(quote[1]!)])
    }
    else {
      lines.push(renderInline(line.trim()))
    }
  }
  while (lines.length > 0 && lines[lines.length - 1]!.length === 0)
    lines.pop()
  return lines
}
