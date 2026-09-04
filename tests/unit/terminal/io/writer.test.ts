import type { OutputLine } from '~/terminal/types'
import { describe, expect, it } from 'vitest'
import { CaptureWriter, LineWriter } from '~/terminal/io/writer'

function make(style?: 'error') {
  const lines: OutputLine[] = []
  let id = 0
  const w = new LineWriter(l => lines.push(l), () => ++id, style)
  const text = () => lines.map(l => l.spans.map(s => s.text).join(''))
  return { w, lines, text }
}

describe('lineWriter', () => {
  it('splits on newlines and keeps partial lines until flush', () => {
    const { w, text } = make()
    w.write('a\nb')
    expect(text()).toEqual(['a'])
    w.flush()
    expect(text()).toEqual(['a', 'b'])
  })

  it('line() appends a newline; empty line() emits an empty line', () => {
    const { w, lines } = make()
    w.line('x')
    w.line()
    expect(lines).toHaveLength(2)
    expect(lines[1]!.spans).toEqual([])
  })

  it('applies default and explicit styles and links', () => {
    const { w, lines } = make('error')
    w.write('bad')
    w.link('gh', 'https://x')
    w.line('', 'dim')
    expect(lines[0]!.spans).toEqual([
      { text: 'bad', style: 'error' },
      { text: 'gh', style: 'accent', href: 'https://x' },
    ])
  })

  it('raw appends spans to the current line', () => {
    const { w, lines } = make()
    w.raw([{ text: 'art', style: 'pre' }])
    w.line()
    expect(lines[0]!.spans).toEqual([{ text: 'art', style: 'pre' }])
  })

  it('assigns increasing ids', () => {
    const { w, lines } = make()
    w.line('a')
    w.line('b')
    expect(lines.map(l => l.id)).toEqual([1, 2])
  })

  it('flush without content emits nothing', () => {
    const { w, lines } = make()
    w.flush()
    expect(lines).toEqual([])
  })
})

describe('captureWriter', () => {
  it('captures plain text', () => {
    const c = new CaptureWriter()
    c.write('a')
    c.line('b')
    c.link('L', 'h')
    c.raw([{ text: 'r' }])
    expect(c.text()).toBe('ab\nLr')
  })

  it('flush is a no-op', () => {
    const c = new CaptureWriter()
    c.line('x')
    c.flush()
    expect(c.text()).toBe('x\n')
  })
})
