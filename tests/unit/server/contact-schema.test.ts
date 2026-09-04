import { describe, expect, it } from 'vitest'
import { ContactSchema } from '#shared/schemas/contact'

describe('contactSchema', () => {
  const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, I have a role for you.' }
  it('accepts a valid payload', () => {
    expect(ContactSchema.parse(valid)).toEqual(valid)
  })

  it('rejects short messages and bad emails', () => {
    expect(ContactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false)
    expect(ContactSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
  })

  it('carries an optional turnstile token and rejects oversized ones', () => {
    expect(ContactSchema.parse({ ...valid, turnstileToken: 'tok' }).turnstileToken).toBe('tok')
    expect(ContactSchema.safeParse({ ...valid, turnstileToken: 'x'.repeat(2049) }).success).toBe(false)
  })

  it('rejects a filled honeypot', () => {
    expect(ContactSchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(false)
    expect(ContactSchema.safeParse({ ...valid, website: '' }).success).toBe(true)
  })
})
