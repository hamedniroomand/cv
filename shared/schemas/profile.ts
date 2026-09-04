import { z } from 'zod'

export const ProfileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().optional(),
  location: z.object({
    city: z.string(),
    country: z.string(),
    tz: z.string(),
  }),
  remote: z.boolean(),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
  links: z.object({
    github: z.string(),
    linkedin: z.string(),
    email: z.string(),
    website: z.string().optional(),
  }),
  /** Long resume summary (man page, print). */
  summary: z.string().min(1),
  /** One-line description for <meta description> and Open Graph. Search engines truncate around 160 characters. */
  description: z.string().min(1).max(160),
})
export type Profile = z.infer<typeof ProfileSchema>
