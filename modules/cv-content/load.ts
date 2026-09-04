import type { CvData } from '#shared/schemas/cv'
import type { Education } from '#shared/schemas/education'
import type { Experience, Highlight } from '#shared/schemas/experience'
import type { Project } from '#shared/schemas/project'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { marked } from 'marked'
import { z } from 'zod'
import { CvDataSchema } from '#shared/schemas/cv'
import { EducationFrontmatter } from '#shared/schemas/education'
import { ExperienceFrontmatter, HighlightFrontmatter } from '#shared/schemas/experience'
import { ProfileSchema } from '#shared/schemas/profile'
import { ProjectFrontmatter } from '#shared/schemas/project'
import { SkillsSchema } from '#shared/schemas/skills'
import { parseFrontmatter } from './frontmatter.ts'

export type ReadmeFetcher = (repo: string) => Promise<string | null>

marked.setOptions({ gfm: true, async: false })

export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`content validation failed in ${file}: ${detail}`)
    this.name = 'ContentError'
  }
}

function render(markdown: string): string {
  return marked.parse(markdown) as string
}

function rendered(body: string): { body: string, html: string } {
  return { body, html: render(body) }
}

function validate<T>(schema: z.ZodType<T>, value: unknown, file: string): T {
  const result = schema.safeParse(value)
  if (!result.success)
    throw new ContentError(file, z.prettifyError(result.error))
  return result.data
}

function slugOf(fileName: string): string {
  return fileName.replace(/\.md$/, '')
}

function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order
}

async function readText(path: string): Promise<string> {
  return readFile(path, 'utf8')
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readText(path))
}

async function readMarkdown(path: string) {
  return parseFrontmatter(await readText(path))
}

async function listDirs(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true })
  return entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
}

async function listMarkdown(path: string): Promise<string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true })
    return entries.filter(entry => entry.isFile() && entry.name.endsWith('.md')).map(entry => entry.name).sort()
  }
  catch {
    return []
  }
}

async function loadHighlights(dir: string): Promise<Highlight[]> {
  const highlights: Highlight[] = []
  for (const name of await listMarkdown(dir)) {
    const file = join(dir, name)
    const { data, body } = await readMarkdown(file)
    highlights.push({ ...validate(HighlightFrontmatter, data, file), slug: slugOf(name), ...rendered(body) })
  }
  return highlights.sort(byOrder)
}

async function loadExperience(dir: string): Promise<Experience[]> {
  const experiences: Experience[] = []
  for (const slug of await listDirs(dir)) {
    const file = join(dir, slug, 'index.md')
    const { data, body } = await readMarkdown(file)
    experiences.push({
      ...validate(ExperienceFrontmatter, data, file),
      slug,
      ...rendered(body),
      highlights: await loadHighlights(join(dir, slug, 'highlights')),
    })
  }
  return experiences.sort(byOrder)
}

async function loadProjects(dir: string, fetchReadme: ReadmeFetcher): Promise<Project[]> {
  const projects: Project[] = []
  for (const name of await listMarkdown(dir)) {
    const file = join(dir, name)
    const { data, body } = await readMarkdown(file)
    const frontmatter = validate(ProjectFrontmatter, data, file)
    const remote = await fetchReadme(frontmatter.repo)
    projects.push({
      ...frontmatter,
      slug: slugOf(name),
      ...rendered(remote ?? body),
      readmeSource: remote ? 'github' : 'fallback',
    })
  }
  return projects
}

async function loadEducation(file: string): Promise<Education> {
  const { data, body } = await readMarkdown(file)
  return { ...validate(EducationFrontmatter, data, file), ...rendered(body) }
}

async function loadJson<T>(schema: z.ZodType<T>, file: string): Promise<T> {
  return validate(schema, await readJson(file), file)
}

export async function loadContent(contentDir: string, fetchReadme: ReadmeFetcher, now = new Date()): Promise<CvData> {
  const at = (name: string): string => join(contentDir, name)
  const profile = await loadJson(ProfileSchema, at('profile.json'))
  const skills = await loadJson(SkillsSchema, at('skills.json'))
  const about = await readMarkdown(at('about.md'))
  const secrets = await readMarkdown(at('secrets.md'))

  const data: CvData = {
    profile,
    about: rendered(about.body),
    experience: await loadExperience(at('experience')),
    projects: await loadProjects(at('projects'), fetchReadme),
    skills,
    education: await loadEducation(at('education.md')),
    secrets: { body: secrets.body },
    generatedAt: now.toISOString(),
  }
  return validate(CvDataSchema, data, contentDir)
}
