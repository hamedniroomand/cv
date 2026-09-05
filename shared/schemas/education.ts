import { z } from 'zod';

import { RenderedBody, YearMonth } from './common.ts';

export const EducationFrontmatter = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().min(1),
  location: z.string().min(1),
  start: YearMonth,
  end: YearMonth,
});

export const EducationSchema = EducationFrontmatter.extend(RenderedBody.shape);
export type Education = z.infer<typeof EducationSchema>;
