import { expect, test } from '@playwright/test';

test.describe('api', () => {
  test.skip(({ isMobile }) => isMobile, 'runs once');

  test('GET /api/cv returns the profile without secrets', async ({ request }) => {
    const res = await request.get('/api/cv');
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['access-control-allow-origin']).toBe('*');
    const body = await res.json();
    expect(body.profile.name).toBe('Hamed Niroomand');
    expect(body.secrets).toBeUndefined();
  });

  test('removed JSON routes answer 404', async ({ request }) => {
    expect((await request.get('/api/experience')).status()).toBe(404);
    expect((await request.get('/api/skills')).status()).toBe(404);
    expect((await request.get('/api/projects')).status()).toBe(404);
  });

  test('OPTIONS preflight answers with CORS headers', async ({ request }) => {
    const res = await request.fetch('/api/cv', { method: 'OPTIONS' });
    expect(res.status()).toBe(204);
    expect(res.headers()['access-control-allow-origin']).toBe('*');
  });

  test('contact validates input', async ({ request }) => {
    const bad = await request.post('/api/contact', {
      data: { name: '', email: 'x', message: 'hi' },
    });
    expect(bad.status()).toBe(400);
    const ok = await request.post('/api/contact', {
      data: {
        name: 'Ada',
        email: 'ada@example.com',
        message: 'Hello there, this is long enough.',
        turnstileToken: 'test-token',
      },
    });
    expect(ok.ok()).toBeTruthy();
    expect((await ok.json()).ok).toBe(true);
  });

  test('contact requires a turnstile token when a secret is configured', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'Ada', email: 'ada@example.com', message: 'Hello there, this is long enough.' },
    });
    expect(res.status()).toBe(403);
  });
});
