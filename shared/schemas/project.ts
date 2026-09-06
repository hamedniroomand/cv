import { z } from 'zod';

import { RenderedBody } from './common.ts';

export const ProjectFrontmatter = z
  .object({
    name: z.string().min(1),
    repo: z
      .string()
      .regex(/^[\w.-]+\/[\w.-]+$/)
      .optional(),
    site: z.string().url().optional(),
    docs: z.string().url().optional(),
    tagline: z.string().min(1),
    stack: z.array(z.string()),
  })
  .refine(value => value.repo !== undefined || value.site !== undefined, {
    message: 'a project needs a repo or site link',
    path: ['repo'],
  });

export const ProjectSchema = ProjectFrontmatter.safeExtend({
  slug: z.string(),
  readmeSource: z.enum(['github', 'fallback']),
}).safeExtend(RenderedBody.shape);
export type Project = z.infer<typeof ProjectSchema>;
