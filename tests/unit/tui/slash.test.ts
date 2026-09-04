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
})
