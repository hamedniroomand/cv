import type { Span } from '../types'

type Fence = 'code' | 'mermaid' | null

const RULE: Span = { text: '────────', style: 'dim' }
const BULLET: Span = { text: '  • ', style: 'dim' }
const QUOTE: Span = { text: '│ ', style: 'dim' }
const DIAGRAM: Span = { text: '(mermaid diagram omitted)', style: 'dim' }

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ' }

const HTML_TAG = /<[a-z/!][^>]*>/i
const HEADING_TAG = /^<h([1-6])\b[^>]*>(.*)<\/h\1>$/i
const ANCHOR_TAG = /<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi
const CODE_TAG = /<code\b[^>]*>(.*?)<\/code>/gi
const ANY_TAG = /<[^>]+>/g
const ENTITY = /&(#\d+|\w+);/g
const LINE_BREAK = /<br\s*\/?>/gi

const HEADING = /^#{1,6} +(\S.*)$/
const RULE_LINE = /^(?:-{3,}|\*{3,}|_{3,})$/
const LIST_ITEM = /^ *(?:[-*+]|\d+[.)]) +(\S.*)$/
const QUOTE_LINE = /^>\s?(.*)$/
const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|(?<![\w*])[*_]([^*_]+)[*_](?![\w*])/g

function decodeEntity(match: string, name: string): string {
  if (name.startsWith('#'))
    return String.fromCodePoint(Number(name.slice(1)))
  return ENTITIES[name] ?? match
}

function anchorToMarkdown(_match: string, href: string, inner: string): string {
  const label = inner.replace(ANY_TAG, '').trim()
  return label ? `[${label}](${href})` : ''
}

function htmlToText(line: string): string {
  const heading = HEADING_TAG.exec(line)
  if (heading)
    return `${'#'.repeat(Number(heading[1]))} ${htmlToText(heading[2]!)}`
  return line
    .replace(ANCHOR_TAG, anchorToMarkdown)
    .replace(CODE_TAG, '`$1`')
    .replace(ANY_TAG, '')
    .replace(ENTITY, decodeEntity)
    .trim()
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

export function renderInline(text: string): Span[] {
  const spans: Span[] = []
  const push = (span: Span): void => {
    if (span.text.length > 0)
      spans.push(span)
  }
  let last = 0
  for (const match of text.matchAll(INLINE)) {
    push({ text: text.slice(last, match.index) })
    const [, label, href, code, strong, emphasis] = match
    if (href !== undefined)
      push({ text: label!, style: 'accent', href })
    else if (code !== undefined)
      push({ text: code, style: 'accent' })
    else if (strong !== undefined)
      push({ text: strong, style: 'accent' })
    else
      push({ text: emphasis! })
    last = match.index + match[0].length
  }
  push({ text: text.slice(last) })
  return mergePlain(spans)
}

function blockSpans(line: string): Span[] {
  const heading = HEADING.exec(line)
  if (heading)
    return [{ text: heading[1]!, style: 'accent' }]
  if (RULE_LINE.test(line))
    return [RULE]
  const item = LIST_ITEM.exec(line)
  if (item)
    return [BULLET, ...renderInline(item[1]!)]
  const quote = QUOTE_LINE.exec(line)
  if (quote)
    return [QUOTE, ...renderInline(quote[1]!)]
  return renderInline(line.trim())
}

function pushBlank(lines: Span[][]): void {
  if (lines.length > 0 && lines[lines.length - 1]!.length > 0)
    lines.push([])
}

function openFence(line: string): Fence {
  return /^```\s*mermaid\b/.test(line) ? 'mermaid' : 'code'
}

export function renderMarkdown(source: string): Span[][] {
  const lines: Span[][] = []
  let fence: Fence = null

  for (const raw of source.replace(LINE_BREAK, '\n').split('\n')) {
    const line = raw.trimEnd()
    if (line.startsWith('```')) {
      fence = fence ? null : openFence(line)
      if (fence === 'mermaid')
        lines.push([DIAGRAM])
      continue
    }
    if (fence === 'mermaid')
      continue
    if (fence === 'code') {
      lines.push([{ text: raw, style: 'pre' }])
      continue
    }
    if (HTML_TAG.test(line)) {
      const text = htmlToText(line)
      if (text !== '')
        lines.push(blockSpans(text))
      continue
    }
    if (line === '')
      pushBlank(lines)
    else
      lines.push(blockSpans(line))
  }

  while (lines.length > 0 && lines[lines.length - 1]!.length === 0)
    lines.pop()
  return lines
}
