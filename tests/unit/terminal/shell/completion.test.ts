import type { Command } from '~/terminal/types'
import { describe, expect, it } from 'vitest'
import { buildTree, HOME } from '#shared/cv/build-tree'
import { Vfs } from '~/terminal/fs/vfs'
import { completeLine } from '~/terminal/shell/completion'
import { createRegistry } from '~/terminal/shell/registry'
import { fixtureCv } from '../../fixtures/cv'

const cmd = (name: string, complete?: Command['complete']): Command => ({ name, description: '', usage: name, run: () => 0, complete })
const ctx = {
  fs: new Vfs(buildTree(fixtureCv), { home: HOME }),
  registry: createRegistry([cmd('cat'), cmd('cd'), cmd('clear'), cmd('theme', () => ['dark', 'light'])]),
  cv: fixtureCv,
}

describe('completeLine', () => {
  it('completes command names', () => {
    expect(completeLine('cl', ctx)).toEqual({ line: 'clear ', candidates: ['clear'] })
    expect(completeLine('c', ctx).candidates).toEqual(['cat', 'cd', 'clear'])
    expect(completeLine('c', ctx).line).toBe('c')
  })
  it('completes paths by default', () => {
    expect(completeLine('cat ab', ctx)).toEqual({ line: 'cat about.md ', candidates: ['about.md'] })
    expect(completeLine('cat exp', ctx).line).toBe('cat experience/')
    expect(completeLine('cat experience/acme/', ctx).candidates).toEqual(['experience/acme/README.md', 'experience/acme/highlights/'])
    expect(completeLine('cat ', ctx).candidates.length).toBeGreaterThan(3)
  })
  it('delegates to command.complete', () => {
    expect(completeLine('theme d', ctx)).toEqual({ line: 'theme dark ', candidates: ['dark'] })
    expect(completeLine('theme ', ctx).candidates).toEqual(['dark', 'light'])
  })
  it('returns nothing for unknown command args or empty line', () => {
    expect(completeLine('zzz x', ctx)).toEqual({ line: 'zzz x', candidates: [] })
    expect(completeLine('', ctx).candidates).toEqual(['cat', 'cd', 'clear', 'theme'])
  })
  it('completes after a pipe', () => {
    expect(completeLine('cat about.md | cl', ctx)).toEqual({ line: 'cat about.md | clear ', candidates: ['clear'] })
  })
})
