import type { OutputLine } from '~/terminal/types'
import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'
import { fixtureCv } from '../../fixtures/cv'

function stderrText(lines: OutputLine[]): string {
  return lines
    .filter(l => l.spans.some(s => s.style === 'error' || s.style === 'dim'))
    .map(l => l.spans.map(s => s.text).join(''))
    .join('\n')
}

function stdoutText(lines: OutputLine[]): string {
  return lines
    .filter(l => !l.spans.some(s => s.style === 'error' || s.style === 'dim'))
    .map(l => l.spans.map(s => s.text).join(''))
    .join('\n')
}

describe('curl', () => {
  it('fetches /api/cv and prints the body', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('curl /api/cv')).code).toBe(0)
    expect(stdoutText(s.lines)).toBe(JSON.stringify(fixtureCv))
    expect(stderrText(s.lines)).toBe('→ GET /api/cv')
    expect(s.calls.requests[0]!.url).toBe('https://hamed.test/api/cv')
  })

  it('pipes JSON into jq', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('curl -s /api/cv | jq .profile.name')).code).toBe(0)
    expect(stdoutText(s.lines)).toBe('"Hamed Niroomand"')
  })

  it('includes response headers with -i', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('curl -i /api/cv')).code).toBe(0)
    const out = stdoutText(s.lines)
    expect(out.split('\n')[0]).toBe('HTTP/1.1 200 OK')
    expect(out).toContain('content-type: application/json')
  })

  it('refuses off-origin urls with exit 7', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('curl https://evil.test/x')).code).toBe(7)
    expect(stderrText(s.lines)).toContain('https://hamed.test')
  })

  it('reports network failures with exit 6', async () => {
    const s = makeShell(commands, {
      net: {
        fetch: async () => {
          throw new Error('network down')
        },
      },
    })
    expect((await s.shell.exec('curl /api/cv')).code).toBe(6)
    expect(stderrText(s.lines)).toContain('Could not resolve host')
  })

  it('passes the abort signal to fetch', async () => {
    const s = makeShell(commands)
    const ac = new AbortController()
    await s.shell.exec('curl /api/cv', ac.signal)
    expect(s.calls.requests[0]!.init?.signal).toBe(ac.signal)
  })

  it('exits 22 on non-2xx when -f is set', async () => {
    const s = makeShell(commands, {
      net: {
        fetch: async () => new Response('not found', { status: 404 }),
      },
    })
    expect((await s.shell.exec('curl -f /api/cv')).code).toBe(22)
  })

  it('keeps exit 0 on non-2xx without -f', async () => {
    const s = makeShell(commands, {
      net: {
        fetch: async () => new Response('not found', { status: 404 }),
      },
    })
    expect((await s.shell.exec('curl /api/cv')).code).toBe(0)
  })
})
