export interface RateLimiterOptions {
  limit: number
  windowMs: number
  now?: () => number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

/** Fixed-window in-memory limiter. Good enough for one process and a contact form. */
export function createRateLimiter(opts: RateLimiterOptions) {
  const now = opts.now ?? Date.now
  const windows = new Map<string, { start: number, count: number }>()

  function sweep(t: number): void {
    for (const [key, w] of windows) {
      if (t - w.start >= opts.windowMs)
        windows.delete(key)
    }
  }

  return {
    hit(key: string): RateLimitResult {
      const t = now()
      if (windows.size > 1000)
        sweep(t)
      let w = windows.get(key)
      if (!w || t - w.start >= opts.windowMs) {
        w = { start: t, count: 0 }
        windows.set(key, w)
      }
      w.count++
      if (w.count > opts.limit)
        return { allowed: false, remaining: 0, retryAfterMs: w.start + opts.windowMs - t }
      return { allowed: true, remaining: opts.limit - w.count, retryAfterMs: 0 }
    },
    size(): number {
      sweep(now())
      return windows.size
    },
  }
}
