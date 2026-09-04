import { describe, expect, it, vi } from 'vitest'
import { fetchGithubReadme } from '../../../modules/cv-content/cue-readme'

describe('fetchGithubReadme', () => {
  it('returns the README body on success', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      expect(url).toBe('https://raw.githubusercontent.com/owner/repo/HEAD/README.md')
      return new Response('# Cue\n', { status: 200 })
    })
    await expect(fetchGithubReadme('owner/repo', fetchImpl as typeof fetch)).resolves.toBe('# Cue\n')
  })

  it('returns null on HTTP errors, empty bodies, and network failures', async () => {
    await expect(fetchGithubReadme('a/b', async () => new Response('x', { status: 404 }))).resolves.toBeNull()
    await expect(fetchGithubReadme('a/b', async () => new Response('   ', { status: 200 }))).resolves.toBeNull()
    await expect(fetchGithubReadme('a/b', async () => {
      throw new Error('offline')
    })).resolves.toBeNull()
  })

  it('uses global fetch by default', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('# ok\n', { status: 200 }))
    try {
      await expect(fetchGithubReadme('owner/repo')).resolves.toBe('# ok\n')
    }
    finally {
      spy.mockRestore()
    }
  })
})
