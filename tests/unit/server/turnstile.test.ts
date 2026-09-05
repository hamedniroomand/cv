import { describe, expect, it, vi } from 'vite-plus/test';

import { verifyTurnstile } from '#server/utils/turnstile';

const cfg = { secretKey: 'secret-1', token: 'tok-1', ip: '203.0.113.7' };

describe('verifyTurnstile', () => {
  it('posts the secret, token and ip form-encoded to siteverify and accepts a success', async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    expect(await verifyTurnstile(cfg, fetchImpl as unknown as typeof fetch)).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init.method).toBe('POST');
    const body = new URLSearchParams(String(init.body));
    expect(body.get('secret')).toBe('secret-1');
    expect(body.get('response')).toBe('tok-1');
    expect(body.get('remoteip')).toBe('203.0.113.7');
  });

  it('rejects when cloudflare says no', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }),
          { status: 200 },
        ),
    );
    expect(await verifyTurnstile(cfg, fetchImpl as unknown as typeof fetch)).toBe(false);
  });

  it('rejects a missing token without calling cloudflare', async () => {
    const fetchImpl = vi.fn();
    expect(
      await verifyTurnstile({ ...cfg, token: undefined }, fetchImpl as unknown as typeof fetch),
    ).toBe(false);
    expect(await verifyTurnstile({ ...cfg, token: '' }, fetchImpl as unknown as typeof fetch)).toBe(
      false,
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('fails closed on network errors and non-json replies', async () => {
    const boom = vi.fn(async () => {
      throw new Error('offline');
    });
    expect(await verifyTurnstile(cfg, boom as unknown as typeof fetch)).toBe(false);
    const html = vi.fn(async () => new Response('<html>', { status: 502 }));
    expect(await verifyTurnstile(cfg, html as unknown as typeof fetch)).toBe(false);
  });
});
