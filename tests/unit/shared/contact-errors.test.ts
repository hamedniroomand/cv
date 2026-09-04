import { describe, expect, it } from 'vitest'
import { contactFieldErrors, issuesToFieldErrors } from '#shared/schemas/contact'

describe('contactFieldErrors', () => {
  it('returns one message per invalid field and nothing for a valid form', () => {
    expect(contactFieldErrors({ name: '', email: 'asd', message: 'hi' })).toEqual({
      name: 'name is required',
      email: 'email must be valid',
      message: 'message must be at least 10 characters',
    })
    expect(contactFieldErrors({ name: 'Ada', email: 'ada@example.com', message: 'Hello there, long enough.' })).toEqual({})
  })
})

describe('issuesToFieldErrors', () => {
  it('maps the API issue tree to first messages and ignores garbage', () => {
    const issues = { email: { errors: ['email must be valid', 'too long'] }, message: { errors: ['message must be at least 10 characters'] } }
    expect(issuesToFieldErrors(issues)).toEqual({ email: 'email must be valid', message: 'message must be at least 10 characters' })
    expect(issuesToFieldErrors(undefined)).toEqual({})
    expect(issuesToFieldErrors([{ message: 'x' }])).toEqual({})
    expect(issuesToFieldErrors({ email: { errors: [] }, bogus: 'nope' })).toEqual({})
  })
})
