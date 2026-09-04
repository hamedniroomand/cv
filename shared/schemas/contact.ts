import { z } from 'zod'

export const ContactSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100),
  email: z.string().trim().email('email must be valid').max(200),
  message: z.string().trim().min(10, 'message must be at least 10 characters').max(5000),
  /** Honeypot. Humans never see it; anything in it means a bot. */
  website: z.string().max(0, 'invalid submission').optional(),
  /** Cloudflare Turnstile response token; required by the API whenever a secret key is configured. */
  turnstileToken: z.string().max(2048).optional(),
})
export type ContactMessage = z.infer<typeof ContactSchema>

export type ContactField = keyof ContactMessage
export type ContactFieldErrors = Partial<Record<ContactField, string>>

const FIELDS = Object.keys(ContactSchema.shape) as ContactField[]

/**
 * The API's `issues` payload (`z.treeifyError(...).properties`) reduced to the first message per field.
 * Tolerates anything else (arrays, missing, foreign keys) by ignoring it.
 */
export function issuesToFieldErrors(issues: unknown): ContactFieldErrors {
  const out: ContactFieldErrors = {}
  if (typeof issues !== 'object' || issues === null || Array.isArray(issues))
    return out
  for (const field of FIELDS) {
    const entry = (issues as Record<string, unknown>)[field]
    const errors = (entry as { errors?: unknown } | undefined)?.errors
    const first = Array.isArray(errors) ? errors.find(e => typeof e === 'string') : undefined
    if (first)
      out[field] = first
  }
  return out
}

/** Client-side mirror of the API validation: first message per invalid field, `{}` when the form is valid. */
export function contactFieldErrors(input: unknown): ContactFieldErrors {
  const parsed = ContactSchema.safeParse(input)
  return parsed.success ? {} : issuesToFieldErrors(z.treeifyError(parsed.error).properties)
}

export interface ContactFailureFeedback {
  errors: ContactFieldErrors
  message: string
}

const GENERIC_FAILURE = 'Could not send. Try email instead.'

export function contactFailureFeedback(data: unknown): ContactFailureFeedback {
  const payload = (typeof data === 'object' && data !== null ? data : {}) as { message?: unknown, issues?: unknown }
  const errors = issuesToFieldErrors(payload.issues)
  const { website, turnstileToken, ...fieldErrors } = errors
  if (Object.keys(fieldErrors).length > 0)
    return { errors, message: '' }
  const message = website ?? turnstileToken ?? (typeof payload.message === 'string' ? payload.message : GENERIC_FAILURE)
  return { errors, message }
}
