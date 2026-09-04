export interface TurnstileCheck {
  secretKey: string
  /** Token issued by the widget (`cf-turnstile-response`). */
  token: string | undefined
  /** Visitor IP, when known; lets Cloudflare bind the token to the requester. */
  ip?: string
}

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Validate a Cloudflare Turnstile token. Fails closed: a missing token, a network error or an
 * unexpected reply all count as "not verified" so a Cloudflare outage never opens the form to bots.
 */
export async function verifyTurnstile(check: TurnstileCheck, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  if (!check.token)
    return false
  const body = new URLSearchParams({ secret: check.secretKey, response: check.token })
  if (check.ip)
    body.set('remoteip', check.ip)
  try {
    const res = await fetchImpl(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    const data: unknown = await res.json()
    return typeof data === 'object' && data !== null && (data as { success?: unknown }).success === true
  }
  catch {
    return false
  }
}
