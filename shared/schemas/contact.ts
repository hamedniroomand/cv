import { z } from 'zod';

export const ContactSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100),
  email: z.string().trim().email('email must be valid').max(200),
  message: z.string().trim().min(10, 'message must be at least 10 characters').max(5000),
  website: z.string().max(0, 'invalid submission').optional(),
  turnstileToken: z.string().max(2048).optional(),
});
export type ContactMessage = z.infer<typeof ContactSchema>;

export type ContactField = keyof ContactMessage;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export interface ContactFailureFeedback {
  errors: ContactFieldErrors;
  message: string;
}

const FIELDS = Object.keys(ContactSchema.shape) as ContactField[];
const GENERIC_FAILURE = 'Could not send. Try email instead.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function firstMessage(entry: unknown): string | undefined {
  const errors = isRecord(entry) ? entry.errors : undefined;
  return Array.isArray(errors) ? errors.find(error => typeof error === 'string') : undefined;
}

export function issuesToFieldErrors(issues: unknown): ContactFieldErrors {
  const out: ContactFieldErrors = {};
  if (!isRecord(issues)) return out;
  for (const field of FIELDS) {
    const message = firstMessage(issues[field]);
    if (message) out[field] = message;
  }
  return out;
}

export function contactFieldErrors(input: unknown): ContactFieldErrors {
  const parsed = ContactSchema.safeParse(input);
  return parsed.success ? {} : issuesToFieldErrors(z.treeifyError(parsed.error).properties);
}

export function contactFailureFeedback(data: unknown): ContactFailureFeedback {
  const payload = isRecord(data) ? data : {};
  const errors = issuesToFieldErrors(payload.issues);
  const { website, turnstileToken, ...fieldErrors } = errors;
  if (Object.keys(fieldErrors).length > 0) return { errors, message: '' };
  const apiMessage = typeof payload.message === 'string' ? payload.message : GENERIC_FAILURE;
  return { errors, message: website ?? turnstileToken ?? apiMessage };
}
