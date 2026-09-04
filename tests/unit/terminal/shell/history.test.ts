import { describe, expect, it } from 'vitest'
import { History } from '~/terminal/shell/history'

describe('history', () => {
  it('stores trimmed, non-blank, non-repeated lines', () => {
    const h = new History()
    h.push(' a ')
    h.push('b')
    h.push('b')
    h.push('  ')
    expect(h.list()).toEqual(['a', 'b'])
  })

  it('navigates with draft preservation', () => {
    const h = new History()
    h.push('a')
    h.push('b')
    expect(h.up('draft')).toBe('b')
    expect(h.up('x')).toBe('a')
    expect(h.up('x')).toBeNull()
    expect(h.down()).toBe('b')
    expect(h.down()).toBe('draft')
    expect(h.down()).toBeNull()
  })

  it('push resets the cursor', () => {
    const h = new History()
    h.push('a')
    h.up('')
    h.push('b')
    expect(h.up('')).toBe('b')
  })

  it('caps size', () => {
    const h = new History(2)
    h.push('1')
    h.push('2')
    h.push('3')
    expect(h.list()).toEqual(['2', '3'])
  })
})
