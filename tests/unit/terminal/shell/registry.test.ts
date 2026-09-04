import { describe, expect, it } from 'vitest'
import { createRegistry } from '~/terminal/shell/registry'

const cmd = (name: string, aliases?: string[]) => ({ name, aliases, description: '', usage: name, run: () => 0 })

describe('createRegistry', () => {
  it('resolves names and aliases', () => {
    const r = createRegistry([cmd('ls', ['dir']), cmd('cat')])
    expect(r.get('dir')?.name).toBe('ls')
    expect(r.get('cat')?.name).toBe('cat')
    expect(r.get('nope')).toBeUndefined()
    expect(r.list().map(c => c.name)).toEqual(['cat', 'ls'])
  })

  it('throws on duplicates', () => {
    expect(() => createRegistry([cmd('ls'), cmd('x', ['ls'])])).toThrow(/duplicate/)
    expect(() => createRegistry([cmd('ls'), cmd('ls')])).toThrow(/duplicate/)
  })
})
