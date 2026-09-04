import type { AppCommand } from '~/tui/types'
import { describe, expect, it } from 'vitest'
import { createAppRegistry } from '~/tui/registry'

function cmd(name: string, aliases?: string[]): AppCommand {
  return {
    name,
    aliases,
    description: '',
    run: () => 0,
  }
}

describe('createAppRegistry', () => {
  it('rejects duplicate names and aliases', () => {
    const first = cmd('help')
    const duplicate = cmd('x', ['help'])
    expect(() => createAppRegistry([first, duplicate])).toThrow(/duplicate app command/)
  })
})
