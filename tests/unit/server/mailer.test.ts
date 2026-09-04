import { describe, expect, it, vi } from 'vitest'
import { sendContact } from '../../../server/utils/mailer'

const msg = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, long enough.' }

describe('sendContact', () => {
  it('logs when no provider is configured', async () => {
    const info = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = vi.fn()
    expect(await sendContact(msg, { resendApiKey: '', to: '', from: 'a@b.c' }, fetchImpl as unknown as typeof fetch)).toBe('logged')
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(info).toHaveBeenCalled()
    info.mockRestore()
  })
  it('posts to Resend when configured', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }))
    expect(await sendContact(msg, { resendApiKey: 'key', to: 'me@x.y', from: 'cv@x.y' }, fetchImpl as unknown as typeof fetch)).toBe('sent')
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer key')
    const body = JSON.parse(String(init.body))
    expect(body.to).toEqual(['me@x.y'])
    expect(body.reply_to).toBe('ada@example.com')
    expect(body.text).toContain('Hello there')
  })
  it('throws when the provider rejects', async () => {
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 500 }))
    await expect(sendContact(msg, { resendApiKey: 'key', to: 'me@x.y', from: 'cv@x.y' }, fetchImpl as unknown as typeof fetch)).rejects.toThrow(/500/)
  })
})
