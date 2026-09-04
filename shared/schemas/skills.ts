import { z } from 'zod'

export const SkillItemSchema = z.object({
  name: z.string().min(1),
  note: z.string().optional(),
})

export const SkillCategorySchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  label: z.string().min(1),
  items: z.array(SkillItemSchema).min(1),
})
export type SkillCategory = z.infer<typeof SkillCategorySchema>

export const SkillsSchema = z.object({
  categories: z.array(SkillCategorySchema).min(1),
})
export type Skills = z.infer<typeof SkillsSchema>
