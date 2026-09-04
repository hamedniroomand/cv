import { createError, defineEventHandler, getRequestIP } from 'nitro/h3'
import { useRuntimeConfig } from 'nitro/runtime-config'
import { z } from 'zod'
import { ContactSchema } from '#shared/schemas/contact'
import { sendContact } from '../utils/mailer'
import { createRateLimiter } from '../utils/rate-limit'

const limiter = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 })

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const limit = limiter.hit(ip)
  if (!limit.allowed) {
    event.res.headers.set('Retry-After', String(Math.ceil(limit.retryAfterMs / 1000)))
    throw createError({ status: 429, message: 'too many messages, try again later' })
  }

  const raw: unknown = await event.req.json().catch(() => ({}))
  const parsed = ContactSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      status: 400,
      message: 'invalid contact message',
      data: { issues: z.treeifyError(parsed.error).properties ?? {} },
    })
  }

  const config = useRuntimeConfig()
  const delivery = await sendContact(parsed.data, {
    resendApiKey: config.resendApiKey,
    to: config.contactTo,
    from: config.contactFrom,
  })
  return { ok: true, delivery }
})
