import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '~/terminal/io/markdown'

const text = (lines: ReturnType<typeof renderMarkdown>) => lines.map(l => l.map(s => s.text).join(''))

describe('renderMarkdown', () => {
  it('renders headings as accent lines without the hashes', () => {
    const lines = renderMarkdown('# Title\n\n## Sub')
    expect(lines[0]).toEqual([{ text: 'Title', style: 'accent' }])
    expect(lines[1]).toEqual([])
    expect(lines[2]).toEqual([{ text: 'Sub', style: 'accent' }])
  })

  it('keeps line breaks and blank lines, dropping only trailing empties', () => {
    expect(text(renderMarkdown('one\ntwo\n\nthree\n'))).toEqual(['one', 'two', '', 'three'])
  })

  it('renders bullet and numbered list items with a dim bullet', () => {
    const lines = renderMarkdown('- a\n* b\n1. c')
    expect(lines.map(l => l[0])).toEqual(Array.from({ length: 3 }, () => ({ text: '  • ', style: 'dim' })))
    expect(text(lines)).toEqual(['  • a', '  • b', '  • c'])
  })

  it('turns links into clickable accent spans and strips emphasis markers', () => {
    const [line] = renderMarkdown('See [Cue](https://cue.test) and **bold** or *em* and `code`.')
    expect(line).toEqual([
      { text: 'See ' },
      { text: 'Cue', style: 'accent', href: 'https://cue.test' },
      { text: ' and ' },
      { text: 'bold', style: 'accent' },
      { text: ' or em and ' },
      { text: 'code', style: 'accent' },
      { text: '.' },
    ])
  })

  it('keeps fenced code verbatim with the pre style and drops the fences', () => {
    const lines = renderMarkdown('```sh\nbun run dev\n```\nafter')
    expect(lines).toEqual([[{ text: 'bun run dev', style: 'pre' }], [{ text: 'after' }]])
  })

  it('renders rules and quotes dimly', () => {
    const lines = renderMarkdown('---\n> wise words')
    expect(lines[0]).toEqual([{ text: '────────', style: 'dim' }])
    expect(lines[1]).toEqual([{ text: '│ ', style: 'dim' }, { text: 'wise words' }])
  })

  it('drops html scaffolding lines that carry no text', () => {
    const src = [
      '<p align="center">',
      '<img src="logo.svg" width="140" alt="Cue logo" />',
      '</p>',
      '<a href="https://x.test/actions"><img src="https://img.shields.io/badge.svg" alt="Tests" /></a>',
      'after',
    ].join('\n')
    expect(text(renderMarkdown(src))).toEqual(['after'])
  })

  it('renders html headings, links and inline tags as their text', () => {
    const lines = renderMarkdown('<h1 align="center">Cue</h1>\n<p align="center">Turn issues into PRs &amp; more</p>\nSee <a href="https://d.test">docs</a> and <code>cue init</code>.')
    expect(lines[0]).toEqual([{ text: 'Cue', style: 'accent' }])
    expect(lines[1]).toEqual([{ text: 'Turn issues into PRs & more' }])
    expect(lines[2]).toEqual([
      { text: 'See ' },
      { text: 'docs', style: 'accent', href: 'https://d.test' },
      { text: ' and ' },
      { text: 'cue init', style: 'accent' },
      { text: '.' },
    ])
  })

  it('splits on <br> and replaces mermaid blocks with a placeholder', () => {
    expect(text(renderMarkdown('one<br/>two'))).toEqual(['one', 'two'])
    const lines = renderMarkdown('```mermaid\nflowchart LR\n  A --> B\n```\nafter')
    expect(lines).toEqual([[{ text: '(mermaid diagram omitted)', style: 'dim' }], [{ text: 'after' }]])
  })

  it('collapses blank runs and leading blanks left by dropped html', () => {
    expect(text(renderMarkdown('<p align="center">\n\n<h1>Cue</h1>\n\n\nafter'))).toEqual(['Cue', '', 'after'])
  })
})
