import { describe, expect, it, vi } from 'vite-plus/test';

import { fetchGist, fetchGithubReadme } from '~~/modules/cv-content/github';

describe('fetchGithubReadme', () => {
  it('returns the README body on success', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      expect(url).toBe('https://raw.githubusercontent.com/owner/repo/HEAD/README.md');
      return new Response('# Cue\n', { status: 200 });
    });
    await expect(
      fetchGithubReadme('owner/repo', fetchImpl as unknown as typeof fetch),
    ).resolves.toBe('# Cue\n');
  });

  it('returns null on HTTP errors, empty bodies, and network failures', async () => {
    await expect(
      fetchGithubReadme(
        'a/b',
        (async () => new Response('x', { status: 404 })) as unknown as typeof fetch,
      ),
    ).resolves.toBeNull();
    await expect(
      fetchGithubReadme(
        'a/b',
        (async () => new Response('   ', { status: 200 })) as unknown as typeof fetch,
      ),
    ).resolves.toBeNull();
    await expect(
      fetchGithubReadme('a/b', (async () => {
        throw new Error('offline');
      }) as unknown as typeof fetch),
    ).resolves.toBeNull();
  });

  it('uses global fetch by default', async () => {
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('# ok\n', { status: 200 }));
    try {
      await expect(fetchGithubReadme('owner/repo')).resolves.toBe('# ok\n');
    } finally {
      spy.mockRestore();
    }
  });
});

function gistResponse(files: Record<string, { content?: string; truncated?: boolean }>) {
  return new Response(JSON.stringify({ files }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('fetchGist', () => {
  const id = 'dc74c846d1e701c65779fdaf7d58e1bf';

  it('returns the named file content and sends the GitHub accept header', async () => {
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe(`https://api.github.com/gists/${id}`);
      expect(new Headers(init?.headers).get('accept')).toBe('application/vnd.github+json');
      expect(new Headers(init?.headers).has('authorization')).toBe(false);
      return gistResponse({ 'vscode setting': { content: '{ "a": 1 }' } });
    });
    await expect(
      fetchGist(id, 'vscode setting', { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toBe('{ "a": 1 }');
  });

  it('sends a bearer token when given', async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer ghp_x');
      return gistResponse({ f: { content: 'x' } });
    });
    await expect(
      fetchGist(id, 'f', { fetchImpl: fetchImpl as unknown as typeof fetch, token: 'ghp_x' }),
    ).resolves.toBe('x');
  });

  it('returns null on HTTP error, missing file, empty content, truncated file and network failure', async () => {
    const as = (fn: () => Promise<Response>) => ({ fetchImpl: fn as unknown as typeof fetch });
    await expect(
      fetchGist(
        id,
        'f',
        as(async () => new Response('x', { status: 404 })),
      ),
    ).resolves.toBeNull();
    await expect(
      fetchGist(
        id,
        'f',
        as(async () => gistResponse({ other: { content: 'x' } })),
      ),
    ).resolves.toBeNull();
    await expect(
      fetchGist(
        id,
        'f',
        as(async () => gistResponse({ f: { content: '  ' } })),
      ),
    ).resolves.toBeNull();
    await expect(
      fetchGist(
        id,
        'f',
        as(async () => gistResponse({ f: { content: 'x', truncated: true } })),
      ),
    ).resolves.toBeNull();
    await expect(
      fetchGist(
        id,
        'f',
        as(async () => {
          throw new Error('offline');
        }),
      ),
    ).resolves.toBeNull();
    await expect(
      fetchGist(
        id,
        'f',
        as(async () => new Response('not json', { status: 200 })),
      ),
    ).resolves.toBeNull();
  });

  it('aborts after the timeout', async () => {
    const fetchImpl = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    await expect(
      fetchGist(id, 'f', { fetchImpl: fetchImpl as unknown as typeof fetch, timeoutMs: 5 }),
    ).resolves.toBeNull();
  });
});
