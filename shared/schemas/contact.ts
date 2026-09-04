import { z } from 'zod'

export const ContactSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100),
  email: z.string().trim().email('email must be valid').max(200),
  message: z.string().trim().min(10, 'message must be at least 10 characters').max(5000),
  /** Honeypot. Humans never see it; anything in it means a bot. */
  website: z.string().max(0, 'invalid submission').optional(),
})
export type ContactMessage = z.infer<typeof ContactSchema>
