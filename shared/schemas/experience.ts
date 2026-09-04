import { z } from 'zod'
import { DateOrPresent, RenderedBody, YearMonth } from './common'

export const RoleSchema = z.object({
  title: z.string().min(1),
  start: YearMonth,
  end: DateOrPresent,
})
export type Role = z.infer<typeof RoleSchema>

export const ExperienceFrontmatter = z.object({
  company: z.string().min(1),
  url: z.string().url().optional(),
  location: z.string().min(1),
  type: z.enum(['full-time', 'part-time', 'contract']),
  roles: z.array(RoleSchema).min(1),
  stack: z.array(z.string()),
  order: z.number().int(),
})
export type ExperienceFrontmatterData = z.infer<typeof ExperienceFrontmatter>

export const HighlightFrontmatter = z.object({
  title: z.string().min(1),
  order: z.number().int(),
})

export const HighlightSchema = HighlightFrontmatter.extend({ slug: z.string() }).extend(RenderedBody.shape)
export type Highlight = z.infer<typeof HighlightSchema>

export const ExperienceSchema = ExperienceFrontmatter
  .extend({ slug: z.string(), highlights: z.array(HighlightSchema) })
  .extend(RenderedBody.shape)
export type Experience = z.infer<typeof ExperienceSchema>
