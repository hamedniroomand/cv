import { z } from 'zod'
import { RenderedBody } from './common.ts'
import { EducationSchema } from './education.ts'
import { ExperienceSchema } from './experience.ts'
import { ProfileSchema } from './profile.ts'
import { ProjectSchema } from './project.ts'
import { SkillsSchema } from './skills.ts'

export const CvDataSchema = z.object({
  profile: ProfileSchema,
  about: RenderedBody,
  experience: z.array(ExperienceSchema).min(1),
  projects: z.array(ProjectSchema),
  skills: SkillsSchema,
  education: EducationSchema,
  secrets: z.object({ body: z.string() }),
  generatedAt: z.string(),
})
export type CvData = z.infer<typeof CvDataSchema>
