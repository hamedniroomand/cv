import { describe, expect, it } from 'vitest'
import { contactFailureFeedback, contactFieldErrors, issuesToFieldErrors } from '#shared/schemas/contact'

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

describe('contactFailureFeedback', () => {
  it('keeps field errors and clears the form-level message', () => {
    const feedback = contactFailureFeedback({ message: 'Invalid', issues: { email: { errors: ['email must be valid'] } } })
    expect(feedback).toEqual({ errors: { email: 'email must be valid' }, message: '' })
  })

  it('surfaces honeypot and captcha errors as the form-level message', () => {
    expect(contactFailureFeedback({ issues: { website: { errors: ['invalid submission'] } } }).message).toBe('invalid submission')
    expect(contactFailureFeedback({ issues: { turnstileToken: { errors: ['captcha failed'] } } }).message).toBe('captcha failed')
  })

  it('falls back to the API message, then to a generic one', () => {
    expect(contactFailureFeedback({ message: 'Rate limited' }).message).toBe('Rate limited')
    expect(contactFailureFeedback(undefined).message).toBe('Could not send. Try email instead.')
    expect(contactFailureFeedback('nope').message).toBe('Could not send. Try email instead.')
  })
})
