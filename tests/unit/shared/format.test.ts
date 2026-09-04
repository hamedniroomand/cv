import { describe, expect, it } from 'vitest'
import { formatRange, formatYearMonth, totalYears } from '#shared/cv/format'

describe('formatYearMonth', () => {
  it('formats YYYY-MM', () => expect(formatYearMonth('2022-09')).toBe('Sep 2022'))
  it('formats present', () => expect(formatYearMonth('present')).toBe('Present'))
})

describe('formatRange', () => {
  it('joins with en dash', () => expect(formatRange('2022-01', 'present')).toBe('Jan 2022 – Present'))
})

describe('totalYears', () => {
  it('spans earliest start to latest end', () => {
    const exp = [
      { roles: [{ title: 'a', start: '2019-05', end: '2021-07' }] },
      { roles: [{ title: 'b', start: '2022-01', end: '2026-08' }] },
    ] as never
    expect(totalYears(exp, new Date('2026-09-04'))).toBe(7)
  })
  it('counts present up to now', () => {
    const exp = [{ roles: [{ title: 'a', start: '2019-05', end: 'present' }] }] as never
    expect(totalYears(exp, new Date('2026-09-04'))).toBe(7)
  })
})
