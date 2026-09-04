import type { AppCommand } from '~/tui/types'
import { describe, expect, it } from 'vitest'
import { filterCommands, parseSlashInput } from '~/tui/slash'

function cmd(name: string, aliases?: string[]): AppCommand {
  return {
    name,
    aliases,
    description: '',
    run: () => 0,
  }
}

const commands = [
  cmd('experience'),
  cmd('export'),
  cmd('example'),
  cmd('help'),
]

describe('parseSlashInput', () => {
  it.each([
    ['/', { name: '', argv: [], partial: true }],
    ['/exp', { name: 'exp', argv: [], partial: true }],
    ['/experience ', { name: 'experience', argv: [], partial: false }],
    ['/experience th', { name: 'experience', argv: ['th'], partial: false }],
    ['ls /tmp', null],
  ])('parses %j', (line, expected) => {
    expect(parseSlashInput(line)).toEqual(expected)
  })
})

describe('filterCommands', () => {
  it('ranks exact, prefix, then subsequence matches', () => {
    expect(filterCommands('exp', commands).map(c => c.name)).toEqual(['experience', 'export', 'example'])
  })

  it('ranks exact alias matches before prefix matches', () => {
    const tiered = [
      cmd('pdfium'),
      cmd('document', ['pdf']),
    ]
    expect(filterCommands('pdf', tiered).map(c => c.name)).toEqual(['document', 'pdfium'])
  })

  it('matches case-insensitively', () => {
    expect(filterCommands('EXP', commands).map(c => c.name)).toEqual(['experience', 'export', 'example'])
  })

  it('excludes non-matching commands', () => {
    expect(filterCommands('exp', commands).map(c => c.name)).not.toContain('help')
  })

  it('sorts within a tier by canonical name regardless of input order', () => {
    const shuffled = [
      cmd('export'),
      cmd('experience'),
    ]
    expect(filterCommands('exp', shuffled).map(c => c.name)).toEqual(['experience', 'export'])
  })
})
