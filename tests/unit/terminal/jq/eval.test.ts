import { describe, expect, it } from 'vitest'
import { evalJq, formatJson, JqRuntimeError } from '~/terminal/jq/eval'
import { parseJq } from '~/terminal/jq/parse'

const data = {
  categories: [
    { id: 'a', items: [{ name: 'x' }, { name: 'y' }] },
    { id: 'b', items: [] },
  ],
  n: 1,
}
const run = (expr: string, input: unknown = data) => evalJq(parseJq(expr), input as never)

describe('evalJq', () => {
  it('evaluates identity and fields', () => {
    expect(run('.')).toEqual([data])
    expect(run('.n')).toEqual([1])
    expect(run('.missing')).toEqual([null])
  })

  it('iterates and pipes nested values', () => {
    expect(run('.categories[] | .id')).toEqual(['a', 'b'])
    expect(run('.categories[0].items[] | .name')).toEqual(['x', 'y'])
    expect(run('.categories[5]')).toEqual([null])
  })

  it('returns object keys sorted and array indices in order', () => {
    expect(run('keys')).toEqual([['categories', 'n']])
    expect(run('.categories | keys')).toEqual([[0, 1]])
  })

  it('reports type errors', () => {
    expect(() => run('.n.x')).toThrowError(new JqRuntimeError('Cannot index number with "x"'))
    expect(() => run('.n[]')).toThrow(JqRuntimeError)
  })
})

describe('formatJson', () => {
  it('pretty prints with two spaces', () => {
    expect(formatJson({ a: [1] })).toBe('{\n  "a": [\n    1\n  ]\n}')
  })

  it('prints raw strings', () => {
    expect(formatJson('hi', { raw: true })).toBe('hi')
  })

  it('prints compact JSON', () => {
    expect(formatJson({ a: [1] }, { compact: true })).toBe('{"a":[1]}')
  })
})
