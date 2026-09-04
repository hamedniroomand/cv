import { expect, test } from '@playwright/test'

test.describe('api', () => {
  test.skip(({ isMobile }) => isMobile, 'runs once')

  test('GET /api/cv returns the profile without secrets', async ({ request }) => {
    const res = await request.get('/api/cv')
    expect(res.ok()).toBeTruthy()
    expect(res.headers()['access-control-allow-origin']).toBe('*')
    const body = await res.json()
    expect(body.profile.name).toBe('Hamed Niroomand')
    expect(body.secrets).toBeUndefined()
  })

  test('experience routes', async ({ request }) => {
    expect((await request.get('/api/experience/jack-westin')).ok()).toBeTruthy()
    expect((await request.get('/api/experience/nope')).status()).toBe(404)
    const all = await (await request.get('/api/experience')).json()
    expect(all.map((e: { slug: string }) => e.slug)).toContain('thales')
  })

  test('skills filter and 404', async ({ request }) => {
    const body = await (await request.get('/api/skills?category=frontend')).json()
    expect(body.categories).toHaveLength(1)
    expect((await request.get('/api/skills?category=zzz')).status()).toBe(404)
  })

  test('OPTIONS preflight answers with CORS headers', async ({ request }) => {
    const res = await request.fetch('/api/cv', { method: 'OPTIONS' })
    expect(res.status()).toBe(204)
    expect(res.headers()['access-control-allow-origin']).toBe('*')
  })

  test('contact validates input', async ({ request }) => {
    const bad = await request.post('/api/contact', { data: { name: '', email: 'x', message: 'hi' } })
    expect(bad.status()).toBe(400)
    const ok = await request.post('/api/contact', { data: { name: 'Ada', email: 'ada@example.com', message: 'Hello there, this is long enough.' } })
    expect(ok.ok()).toBeTruthy()
    expect((await ok.json()).ok).toBe(true)
  })
})
