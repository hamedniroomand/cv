export interface TurnstileCheck {
  secretKey: string
  token: string | undefined
  ip?: string
}

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

function isSuccess(data: unknown): boolean {
  return typeof data === 'object' && data !== null && (data as { success?: unknown }).success === true
}

function verifyBody(check: TurnstileCheck): URLSearchParams {
  const body = new URLSearchParams({ secret: check.secretKey, response: check.token ?? '' })
  if (check.ip)
    body.set('remoteip', check.ip)
  return body
}

export async function verifyTurnstile(check: TurnstileCheck, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  if (!check.token)
    return false
  try {
    const res = await fetchImpl(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyBody(check).toString(),
    })
    return isSuccess(await res.json())
  }
  catch {
    return false
  }
}
