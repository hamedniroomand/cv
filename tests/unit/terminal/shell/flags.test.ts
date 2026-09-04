import { describe, expect, it } from 'vitest'
import { parseFlags } from '~/terminal/shell/flags'

describe('parseFlags', () => {
  it('splits combined short flags', () => {
    const r = parseFlags(['-la', 'x'], { boolean: ['l', 'a'] })
    expect([...r.flags]).toEqual(['l', 'a'])
    expect(r.positionals).toEqual(['x'])
  })
  it('accepts long boolean flags', () => {
    expect([...parseFlags(['--pdf'], { boolean: ['pdf'] }).flags]).toEqual(['pdf'])
  })
  it('reads string flags in both forms', () => {
    expect(parseFlags(['-n', '3'], { string: ['n'] }).values).toEqual({ n: '3' })
    expect(parseFlags(['-n3'], { string: ['n'] }).values).toEqual({ n: '3' })
    expect(parseFlags(['--category=frontend'], { string: ['category'] }).values).toEqual({ category: 'frontend' })
    expect(parseFlags(['--category', 'x'], { string: ['category'] }).values).toEqual({ category: 'x' })
  })
  it('collects unknown flags and stops at --', () => {
    const r = parseFlags(['-z', '--', '-l'], { boolean: ['l'] })
    expect(r.unknown).toEqual(['-z'])
    expect(r.positionals).toEqual(['-l'])
  })
  it('treats a lone dash as positional', () => {
    expect(parseFlags(['-'], {}).positionals).toEqual(['-'])
  })
})
