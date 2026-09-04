import { describe, expect, it } from 'vitest'
import { createRateLimiter } from '../../../server/utils/rate-limit'

describe('createRateLimiter', () => {
  it('allows up to limit within the window then blocks', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t })
    expect(rl.hit('a')).toEqual({ allowed: true, remaining: 1, retryAfterMs: 0 })
    expect(rl.hit('a').allowed).toBe(true)
    const blocked = rl.hit('a')
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBe(1000)
    t = 1001
    expect(rl.hit('a').allowed).toBe(true)
    expect(rl.hit('b').allowed).toBe(true)
  })
  it('forgets keys whose window has passed', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 100, now: () => t })
    rl.hit('a')
    t = 500
    rl.hit('b')
    expect(rl.size()).toBe(1)
  })
  it('sweeps stale windows when the map grows large', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 100, now: () => t })
    for (let i = 0; i < 1001; i++)
      rl.hit(`k${i}`)
    t = 1000
    rl.hit('fresh')
    expect(rl.size()).toBe(1)
  })
})
