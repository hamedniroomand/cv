import { describe, expect, it } from 'vitest'
import { siteHost } from '#shared/site-host'

describe('siteHost', () => {
  it('returns the hostname of the configured site url', () => {
    expect(siteHost('https://niroomand.dev')).toBe('niroomand.dev')
    expect(siteHost('http://localhost:3457/')).toBe('localhost')
  })
  it('falls back to the production domain for an invalid url', () => {
    expect(siteHost('')).toBe('niroomand.dev')
    expect(siteHost('not a url')).toBe('niroomand.dev')
  })
})
