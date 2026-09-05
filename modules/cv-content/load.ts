import { join } from 'node:path';

import { marked } from 'marked';
import type { z } from 'zod';

import type { CvData } from '#shared/schemas/cv';
import { CvDataSchema } from '#shared/schemas/cv';
import type { Education } from '#shared/schemas/education';
import { EducationFrontmatter } from '#shared/schemas/education';
import type { Experience, Highlight } from '#shared/schemas/experience';
import { ExperienceFrontmatter, HighlightFrontmatter } from '#shared/schemas/experience';
import { ProfileSchema } from '#shared/schemas/profile';
import type { Project } from '#shared/schemas/project';
import { ProjectFrontmatter } from '#shared/schemas/project';
import { SkillsSchema } from '#shared/schemas/skills';

import { loadDotfiles } from './dotfiles.ts';
import { ContentError } from './errors.ts';
import type { GistFetcher } from './github.ts';
import type { Highlighter } from './highlight.ts';
import {
  byOrder,
  listDirs,
  listMarkdown,
  readJson,
  readMarkdown,
  slugOf,
  validate,
} from './read.ts';

export type ReadmeFetcher = (repo: string) => Promise<string | null>;

export interface LoadDeps {
  fetchReadme: ReadmeFetcher;
  fetchGist: GistFetcher;
  highlight: Highlighter;
}

marked.setOptions({ gfm: true, async: false });

export { ContentError };

function render(markdown: string): string {
  return marked.parse(markdown) as string;
}

function rendered(body: string): { body: string; html: string } {
  return { body, html: render(body) };
}

async function loadHighlights(dir: string): Promise<Highlight[]> {
  const highlights: Highlight[] = [];
  for (const name of await listMarkdown(dir)) {
    const file = join(dir, name);
    const { data, body } = await readMarkdown(file);
    highlights.push({
      ...validate(HighlightFrontmatter, data, file),
      slug: slugOf(name),
      ...rendered(body),
    });
  }
  return highlights.sort(byOrder);
}

async function loadExperience(dir: string): Promise<Experience[]> {
  const experiences: Experience[] = [];
  for (const slug of await listDirs(dir)) {
    const file = join(dir, slug, 'index.md');
    const { data, body } = await readMarkdown(file);
    experiences.push({
      ...validate(ExperienceFrontmatter, data, file),
      slug,
      ...rendered(body),
      highlights: await loadHighlights(join(dir, slug, 'highlights')),
    });
  }
  return experiences.sort(byOrder);
}

async function loadProjects(dir: string, fetchReadme: ReadmeFetcher): Promise<Project[]> {
  const projects: Project[] = [];
  for (const name of await listMarkdown(dir)) {
    const file = join(dir, name);
    const { data, body } = await readMarkdown(file);
    const frontmatter = validate(ProjectFrontmatter, data, file);
    const remote = await fetchReadme(frontmatter.repo);
    projects.push({
      ...frontmatter,
      slug: slugOf(name),
      ...rendered(remote ?? body),
      readmeSource: remote ? 'github' : 'fallback',
    });
  }
  return projects;
}

async function loadEducation(file: string): Promise<Education> {
  const { data, body } = await readMarkdown(file);
  return { ...validate(EducationFrontmatter, data, file), ...rendered(body) };
}

async function loadJson<T>(schema: z.ZodType<T>, file: string): Promise<T> {
  return validate(schema, await readJson(file), file);
}

export async function loadContent(
  contentDir: string,
  deps: LoadDeps,
  now = new Date(),
): Promise<CvData> {
  const at = (name: string): string => join(contentDir, name);
  const profile = await loadJson(ProfileSchema, at('profile.json'));
  const skills = await loadJson(SkillsSchema, at('skills.json'));
  const about = await readMarkdown(at('about.md'));
  const secrets = await readMarkdown(at('secrets.md'));

  const data: CvData = {
    profile,
    about: rendered(about.body),
    experience: await loadExperience(at('experience')),
    projects: await loadProjects(at('projects'), deps.fetchReadme),
    dotfiles: await loadDotfiles(at('dotfiles'), profile.links.github, deps),
    skills,
    education: await loadEducation(at('education.md')),
    secrets: { body: secrets.body },
    generatedAt: now.toISOString(),
  };
  return validate(CvDataSchema, data, contentDir);
}
