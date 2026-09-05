import { z } from 'zod';

import { RenderedBody } from './common.ts';

export const ProjectFrontmatter = z.object({
  name: z.string().min(1),
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  docs: z.string().url().optional(),
  tagline: z.string().min(1),
  stack: z.array(z.string()),
});

export const ProjectSchema = ProjectFrontmatter.extend({
  slug: z.string(),
  readmeSource: z.enum(['github', 'fallback']),
}).extend(RenderedBody.shape);
export type Project = z.infer<typeof ProjectSchema>;
