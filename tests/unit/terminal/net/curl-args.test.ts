import { describe, expect, it } from 'vitest'
import { CurlUsageError, parseCurlArgs, resolveAllowedUrl } from '~/terminal/net/curl-args'

describe('parseCurlArgs', () => {
  it('defaults to GET with one url', () => {
    expect(parseCurlArgs(['/api/cv'])).toMatchObject({ url: '/api/cv', method: 'GET', silent: false, includeHeaders: false, headersOnly: false, fail: false, headers: {} })
  })
  it('reads flags in any order', () => {
    const r = parseCurlArgs(['-si', '-X', 'POST', '-H', 'X-A: 1', '-H', 'X-B:2', '-d', '{"a":1}', '/api/contact'])
    expect(r).toMatchObject({ method: 'POST', silent: true, includeHeaders: true, body: '{"a":1}', headers: { 'X-A': '1', 'X-B': '2', 'Content-Type': 'application/json' } })
  })
  it('-d implies POST; -I implies headers only', () => {
    expect(parseCurlArgs(['-d', 'x=1', '/api/contact']).method).toBe('POST')
    expect(parseCurlArgs(['-I', '/api/cv']).headersOnly).toBe(true)
  })
  it('parses -f/--fail', () => {
    expect(parseCurlArgs(['-f', '/api/cv']).fail).toBe(true)
    expect(parseCurlArgs(['--fail', '/api/cv']).fail).toBe(true)
  })
  it('rejects missing url, two urls, -o', () => {
    expect(() => parseCurlArgs([])).toThrow(CurlUsageError)
    expect(() => parseCurlArgs(['/a', '/b'])).toThrow(CurlUsageError)
    expect(() => parseCurlArgs(['-o', 'x', '/a'])).toThrow(/not supported/)
  })
})

describe('resolveAllowedUrl', () => {
  const site = 'https://hamed.test'
  it('allows relative and same-origin api urls', () => {
    expect(resolveAllowedUrl('/api/cv', site)).toBe('https://hamed.test/api/cv')
    expect(resolveAllowedUrl('https://hamed.test/api/skills?category=x', site)).toBe('https://hamed.test/api/skills?category=x')
    expect(resolveAllowedUrl('hamed.test/api/cv', site)).toBe('https://hamed.test/api/cv')
  })
  it('refuses other origins and non-api paths', () => {
    expect(resolveAllowedUrl('https://evil.test/api/cv', site)).toBeNull()
    expect(resolveAllowedUrl('/print', site)).toBeNull()
    expect(resolveAllowedUrl('https://hamed.test.evil.com/api/cv', site)).toBeNull()
  })
})
