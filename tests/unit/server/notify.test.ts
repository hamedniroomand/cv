import { describe, expect, it, vi } from 'vitest'
import { sendContact } from '../../../server/utils/notify'

const msg = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, long enough. @everyone' }
const hook = 'https://discord.com/api/webhooks/1/abc'

describe('sendContact (discord)', () => {
  it('logs when no webhook is configured', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = vi.fn()
    expect(await sendContact(msg, { discordWebhookUrl: '' }, fetchImpl as unknown as typeof fetch)).toBe('logged')
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('posts an embed to the webhook with mentions disabled', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }))
    expect(await sendContact(msg, { discordWebhookUrl: hook }, fetchImpl as unknown as typeof fetch)).toBe('sent')
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${hook}?wait=true`)
    expect(init.method).toBe('POST')
    const body = JSON.parse(String(init.body))
    expect(body.allowed_mentions).toEqual({ parse: [] })
    expect(body.embeds[0].title).toBe('New message from Ada')
    expect(body.embeds[0].description).toContain('Hello there')
    expect(body.embeds[0].fields[0].value).toBe('ada@example.com')
  })

  it('truncates very long messages to the embed limit', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }))
    await sendContact({ ...msg, message: 'x'.repeat(5000) }, { discordWebhookUrl: hook }, fetchImpl as unknown as typeof fetch)
    const body = JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body))
    expect(body.embeds[0].description.length).toBeLessThanOrEqual(4000)
    expect(body.embeds[0].description.endsWith('…')).toBe(true)
  })

  it('throws when Discord rejects', async () => {
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 429 }))
    await expect(sendContact(msg, { discordWebhookUrl: hook }, fetchImpl as unknown as typeof fetch)).rejects.toThrow(/429/)
  })
})
