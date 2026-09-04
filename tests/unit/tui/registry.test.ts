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
  it('looks up canonical names', () => {
    const registry = createAppRegistry([cmd('help'), cmd('about')])
    expect(registry.get('help')?.name).toBe('help')
    expect(registry.get('about')?.name).toBe('about')
  })

  it('looks up aliases to the canonical command', () => {
    const registry = createAppRegistry([cmd('help', ['h', 'commands'])])
    expect(registry.get('h')?.name).toBe('help')
    expect(registry.get('commands')?.name).toBe('help')
  })

  it('returns undefined for unknown names', () => {
    const registry = createAppRegistry([cmd('help')])
    expect(registry.get('nope')).toBeUndefined()
    expect(registry.get('')).toBeUndefined()
  })

  it('lists commands sorted by canonical name', () => {
    const registry = createAppRegistry([cmd('theme'), cmd('about'), cmd('help')])
    expect(registry.list().map(c => c.name)).toEqual(['about', 'help', 'theme'])
  })

  it('rejects duplicate canonical names', () => {
    expect(() => createAppRegistry([cmd('help'), cmd('help')])).toThrow(/duplicate app command/)
  })

  it('rejects duplicate names and aliases', () => {
    const first = cmd('help')
    const duplicate = cmd('x', ['help'])
    expect(() => createAppRegistry([first, duplicate])).toThrow(/duplicate app command/)
  })
})
