export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface Window {
  start: number;
  count: number;
}

const SWEEP_THRESHOLD = 1000;

export function createRateLimiter(opts: RateLimiterOptions) {
  const now = opts.now ?? Date.now;
  const windows = new Map<string, Window>();

  const expired = (window: Window, time: number): boolean => time - window.start >= opts.windowMs;

  function sweep(time: number): void {
    for (const [key, window] of windows) {
      if (expired(window, time)) windows.delete(key);
    }
  }

  function currentWindow(key: string, time: number): Window {
    const existing = windows.get(key);
    if (existing && !expired(existing, time)) return existing;
    const fresh: Window = { start: time, count: 0 };
    windows.set(key, fresh);
    return fresh;
  }

  return {
    hit(key: string): RateLimitResult {
      const time = now();
      if (windows.size > SWEEP_THRESHOLD) sweep(time);
      const window = currentWindow(key, time);
      window.count++;
      if (window.count > opts.limit)
        return { allowed: false, remaining: 0, retryAfterMs: window.start + opts.windowMs - time };
      return { allowed: true, remaining: opts.limit - window.count, retryAfterMs: 0 };
    },
    size(): number {
      sweep(now());
      return windows.size;
    },
  };
}
