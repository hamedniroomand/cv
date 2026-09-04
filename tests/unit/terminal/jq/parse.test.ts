import { describe, expect, it } from 'vitest'
import { JqSyntaxError, parseJq } from '~/terminal/jq/parse'

describe('parseJq', () => {
  it('parses identity and fields', () => {
    expect(parseJq('.')).toEqual({ type: 'identity' })
    expect(parseJq('.name')).toEqual({ type: 'field', name: 'name' })
    expect(parseJq('.a.b')).toEqual({
      type: 'pipe',
      left: { type: 'field', name: 'a' },
      right: { type: 'field', name: 'b' },
    })
  })

  it('parses iteration, index and keys', () => {
    expect(parseJq('.[]')).toEqual({ type: 'iterate' })
    expect(parseJq('.[2]')).toEqual({ type: 'index', index: 2 })
    expect(parseJq('keys')).toEqual({ type: 'keys' })
    expect(parseJq('.items[]')).toEqual({
      type: 'pipe',
      left: { type: 'field', name: 'items' },
      right: { type: 'iterate' },
    })
  })

  it('parses pipes', () => {
    expect(parseJq('.[] | .name')).toEqual({
      type: 'pipe',
      left: { type: 'iterate' },
      right: { type: 'field', name: 'name' },
    })
  })

  it('rejects garbage and reports its offending token', () => {
    expect(() => parseJq('map(.x)')).toThrow(JqSyntaxError)
    expect(() => parseJq('map(.x)')).toThrowError(/map/)
    expect(() => parseJq('')).toThrow(JqSyntaxError)
  })

  it('reports the token that makes bracket syntax malformed', () => {
    expect(() => parseJq('.a[')).toThrowError(/end of input/)
    expect(() => parseJq('.a[foo]')).toThrowError(/foo/)
    expect(() => parseJq('.a[0 foo]')).toThrowError(/foo/)
  })
})
