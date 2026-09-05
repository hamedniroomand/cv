import { z } from 'zod';

const GIST_ID = /^[0-9a-f]{32}$/;
const HOME_PATH = /^~\/(?:[^/]+\/)*[^/]+$/;

function hasOnlyRealSegments(path: string): boolean {
  return path
    .slice(2)
    .split('/')
    .every(segment => segment !== '.' && segment !== '..');
}

const DotfileGist = z.object({
  id: z.string().regex(GIST_ID, 'expected a 32 character hex gist id'),
  file: z.string().min(1),
});

export const DotfileFrontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  path: z
    .string()
    .regex(HOME_PATH, 'expected a path like ~/.config/app/file')
    .refine(hasOnlyRealSegments, 'path may not contain . or .. segments'),
  lang: z.string().min(1),
  order: z.number(),
  gist: DotfileGist.optional(),
});

export const DotfileSource = z.enum(['gist', 'inline']);
export type DotfileSource = z.infer<typeof DotfileSource>;

export const DotfileSchema = DotfileFrontmatter.extend({
  slug: z.string().min(1),
  content: z.string().min(1),
  html: z.string().min(1),
  source: DotfileSource,
  gistUrl: z.string().url().optional(),
});
export type Dotfile = z.infer<typeof DotfileSchema>;
