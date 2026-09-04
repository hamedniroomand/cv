import { z } from 'zod'
import { RenderedBody } from './common'
import { EducationSchema } from './education'
import { ExperienceSchema } from './experience'
import { ProfileSchema } from './profile'
import { ProjectSchema } from './project'
import { SkillsSchema } from './skills'

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
