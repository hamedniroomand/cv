import type { H3Event } from 'nitro/h3'
import type { ContactMessage } from '#shared/schemas/contact'
import { defineEventHandler, getRequestIP, HTTPError } from 'nitro/h3'
import { useRuntimeConfig } from 'nitro/runtime-config'
import { z } from 'zod'
import { sendContact } from '#server/utils/notify'
import { createRateLimiter } from '#server/utils/rate-limit'
import { verifyTurnstile } from '#server/utils/turnstile'
import { ContactSchema } from '#shared/schemas/contact'

type RuntimeConfig = ReturnType<typeof useRuntimeConfig>

const HOUR_MS = 60 * 60 * 1000
const limiter = createRateLimiter({ limit: 10, windowMs: HOUR_MS })

function enforceRateLimit(event: H3Event, ip: string): void {
  const limit = limiter.hit(ip)
  if (limit.allowed)
    return
  event.res.headers.set('Retry-After', String(Math.ceil(limit.retryAfterMs / 1000)))
  throw new HTTPError({ status: 429, message: 'too many messages, try again later' })
}

async function readMessage(event: H3Event): Promise<ContactMessage> {
  const raw: unknown = await event.req.json().catch(() => ({}))
  const parsed = ContactSchema.safeParse(raw)
  if (parsed.success)
    return parsed.data
  throw new HTTPError({
    status: 400,
    message: 'invalid contact message',
    data: { issues: z.treeifyError(parsed.error).properties ?? {} },
  })
}

async function verifyHuman(config: RuntimeConfig, message: ContactMessage, ip: string): Promise<void> {
  if (!config.turnstile.secretKey)
    return
  const human = await verifyTurnstile({
    secretKey: config.turnstile.secretKey,
    token: message.turnstileToken,
    ip: ip === 'unknown' ? undefined : ip,
  })
  if (!human)
    throw new HTTPError({ status: 403, message: 'captcha check failed, please try again' })
}

async function deliver(config: RuntimeConfig, message: ContactMessage) {
  try {
    const delivery = await sendContact(message, { discordWebhookUrl: config.discordWebhookUrl })
    return { ok: true, delivery }
  }
  catch (err) {
    console.error('[contact] delivery failed:', err instanceof Error ? err.message : err)
    throw new HTTPError({ status: 502, message: 'could not deliver the message right now, please email me directly' })
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  enforceRateLimit(event, ip)
  const message = await readMessage(event)
  const config = useRuntimeConfig()
  await verifyHuman(config, message, ip)
  return deliver(config, message)
})
