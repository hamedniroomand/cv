import { z } from 'zod';

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
  summary: z.string().min(1),
  description: z.string().min(1).max(160),
});
export type Profile = z.infer<typeof ProfileSchema>;
