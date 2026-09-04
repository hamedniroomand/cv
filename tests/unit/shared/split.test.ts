import { describe, expect, it } from 'vitest'
import { clampSplitRatio, parseSplitRatio, SPLIT_DEFAULT, SPLIT_MAX, SPLIT_MIN } from '#shared/split'

describe('parseSplitRatio', () => {
  it('accepts stored ratios inside the allowed range', () => {
    expect(parseSplitRatio('0.7')).toBe(0.7)
    expect(parseSplitRatio(String(SPLIT_MIN))).toBe(SPLIT_MIN)
    expect(parseSplitRatio(String(SPLIT_MAX))).toBe(SPLIT_MAX)
  })

  it('rejects missing, corrupt and out-of-range values', () => {
    for (const raw of [null, '', 'abc', '0', '0.1', '0.95', 'NaN', 'Infinity'])
      expect(parseSplitRatio(raw)).toBeNull()
  })

  it('keeps the default inside the range', () => {
    expect(SPLIT_DEFAULT).toBeGreaterThanOrEqual(SPLIT_MIN)
    expect(SPLIT_DEFAULT).toBeLessThanOrEqual(SPLIT_MAX)
  })
})

describe('clampSplitRatio', () => {
  it('keeps values inside the range', () => {
    expect(clampSplitRatio(0.5)).toBe(0.5)
    expect(clampSplitRatio(0.1)).toBe(SPLIT_MIN)
    expect(clampSplitRatio(0.95)).toBe(SPLIT_MAX)
  })
})
