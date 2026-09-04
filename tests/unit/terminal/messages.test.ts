import { describe, expect, it } from 'vitest'
import { unknownValueMessage } from '~/terminal/messages'

describe('unknownValueMessage', () => {
  it('names the command, the kind, the value and the options', () => {
    expect(unknownValueMessage('skills', 'category', 'x', ['a', 'b'])).toBe('skills: unknown category \'x\' (try: a, b)')
  })
})
