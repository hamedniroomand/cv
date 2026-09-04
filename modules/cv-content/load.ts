import type { CvData } from '../../shared/schemas/cv.ts'
import type { Experience, Highlight } from '../../shared/schemas/experience.ts'
import type { Project } from '../../shared/schemas/project.ts'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { marked } from 'marked'
import { z } from 'zod'
import { CvDataSchema } from '../../shared/schemas/cv.ts'
import { EducationFrontmatter } from '../../shared/schemas/education.ts'
import { ExperienceFrontmatter, HighlightFrontmatter } from '../../shared/schemas/experience.ts'
import { ProfileSchema } from '../../shared/schemas/profile.ts'
import { ProjectFrontmatter } from '../../shared/schemas/project.ts'
import { SkillsSchema } from '../../shared/schemas/skills.ts'
import { parseFrontmatter } from './frontmatter.ts'

export type ReadmeFetcher = (repo: string) => Promise<string | null>

marked.setOptions({ gfm: true, async: false })

function render(md: string): string {
  return marked.parse(md) as string
}

class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`content validation failed in ${file}: ${detail}`)
  }
}

function validate<T>(schema: z.ZodType<T>, value: unknown, file: string): T {
  const r = schema.safeParse(value)
  if (!r.success)
    throw new ContentError(file, z.prettifyError(r.error))
  return r.data
}

async function readText(path: string): Promise<string> {
  return readFile(path, 'utf8')
}

async function readMarkdown(path: string) {
  return parseFrontmatter(await readText(path))
}

async function listDirs(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true })
  return entries.filter(e => e.isDirectory()).map(e => e.name).sort()
}

async function listMarkdown(path: string): Promise<string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true })
    return entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => e.name).sort()
  }
  catch {
    return []
  }
}

async function loadExperience(dir: string): Promise<Experience[]> {
  const out: Experience[] = []
  for (const slug of await listDirs(dir)) {
    const file = join(dir, slug, 'index.md')
    const { data, body } = await readMarkdown(file)
    const fm = validate(ExperienceFrontmatter, data, file)
    const highlights: Highlight[] = []
    const hlDir = join(dir, slug, 'highlights')
    for (const name of await listMarkdown(hlDir)) {
      const hlFile = join(hlDir, name)
      const hl = await readMarkdown(hlFile)
      const hfm = validate(HighlightFrontmatter, hl.data, hlFile)
      highlights.push({ ...hfm, slug: name.replace(/\.md$/, ''), body: hl.body, html: render(hl.body) })
    }
    highlights.sort((a, b) => a.order - b.order)
    out.push({ ...fm, slug, body, html: render(body), highlights })
  }
  return out.sort((a, b) => a.order - b.order)
}

async function loadProjects(dir: string, fetchReadme: ReadmeFetcher): Promise<Project[]> {
  const out: Project[] = []
  for (const name of await listMarkdown(dir)) {
    const file = join(dir, name)
    const { data, body } = await readMarkdown(file)
    const fm = validate(ProjectFrontmatter, data, file)
    const remote = await fetchReadme(fm.repo)
    const readme = remote ?? body
    out.push({ ...fm, slug: name.replace(/\.md$/, ''), body: readme, html: render(readme), readmeSource: remote ? 'github' : 'fallback' })
  }
  return out
}

/** Read, validate and render everything under `contentDir`. Throws with the offending file on invalid content. */
export async function loadContent(contentDir: string, fetchReadme: ReadmeFetcher, now = new Date()): Promise<CvData> {
  const profileFile = join(contentDir, 'profile.json')
  const skillsFile = join(contentDir, 'skills.json')
  const educationFile = join(contentDir, 'education.md')

  const profile = validate(ProfileSchema, JSON.parse(await readText(profileFile)), profileFile)
  const skills = validate(SkillsSchema, JSON.parse(await readText(skillsFile)), skillsFile)
  const about = await readMarkdown(join(contentDir, 'about.md'))
  const secrets = await readMarkdown(join(contentDir, 'secrets.md'))
  const edu = await readMarkdown(educationFile)
  const eduFm = validate(EducationFrontmatter, edu.data, educationFile)

  const data: CvData = {
    profile,
    about: { body: about.body, html: render(about.body) },
    experience: await loadExperience(join(contentDir, 'experience')),
    projects: await loadProjects(join(contentDir, 'projects'), fetchReadme),
    skills,
    education: { ...eduFm, body: edu.body, html: render(edu.body) },
    secrets: { body: secrets.body },
    generatedAt: now.toISOString(),
  }
  return validate(CvDataSchema, data, contentDir)
}
