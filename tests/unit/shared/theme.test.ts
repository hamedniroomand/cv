import { describe, expect, it } from 'vitest'
import { isThemeName, THEMES } from '#shared/theme'

describe('isThemeName', () => {
  it('accepts every listed theme', () => {
    for (const theme of THEMES)
      expect(isThemeName(theme)).toBe(true)
  })

  it('rejects unknown values', () => {
    for (const value of ['solarized', '', null, undefined, 3])
      expect(isThemeName(value)).toBe(false)
  })
})
