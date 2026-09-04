import type { CvData } from '../schemas/cv'
import type { Experience } from '../schemas/experience'
import type { Project } from '../schemas/project'
import type { PanelTarget } from './panel-target'
import type { FsDir, FsNode } from '~/terminal/fs/types'
import { dir, file } from '~/terminal/fs/vfs'
import { formatRange } from './format'

export const HOME = '/home/hamed'

function experienceReadme(exp: Experience): string {
  const roles = [...exp.roles]
    .sort((a, b) => b.start.localeCompare(a.start))
    .map(r => `${r.title} · ${formatRange(r.start, r.end)}`)
  return [
    `# ${exp.company}`,
    ...roles,
    `Location: ${exp.location} · ${exp.type}`,
    `Stack: ${exp.stack.join(', ')}`,
    '',
    exp.body,
  ].join('\n')
}

function experienceDir(exp: Experience, mtime: string): FsDir {
  const panel: PanelTarget = { section: 'experience', slug: exp.slug }
  const children: FsNode[] = [file('README.md', experienceReadme(exp), { mtime, panel })]
  if (exp.highlights.length > 0) {
    children.push(dir(
      'highlights',
      exp.highlights.map(h => file(`${h.slug}.md`, `# ${h.title}\n\n${h.body}`, { mtime, panel })),
      { mtime, panel },
    ))
  }
  return dir(exp.slug, children, { mtime, panel })
}

function projectDir(project: Project, mtime: string): FsDir {
  const panel: PanelTarget = { section: 'projects', slug: project.slug }
  return dir(project.slug, [file('README.md', project.body, { mtime, panel })], { mtime, panel })
}

function contactScript(cv: CvData): string {
  const { links } = cv.profile
  return [
    '#!/bin/sh',
    '# Run `contact` to open the contact form, or reach me directly:',
    `echo "email:    ${links.email}"`,
    `echo "github:   https://github.com/${links.github}"`,
    `echo "linkedin: ${links.linkedin}"`,
    '',
  ].join('\n')
}

function educationMarkdown(cv: CvData): string {
  const e = cv.education
  return [
    `# ${e.degree} ${e.field}`,
    `${e.institution} · ${e.location}`,
    formatRange(e.start, e.end),
    '',
    e.body,
  ].join('\n')
}

/** Build the virtual filesystem root (`/`) from validated content. */
export function buildTree(cv: CvData): FsDir {
  const mtime = cv.generatedAt
  const home = dir('hamed', [
    file('about.md', cv.about.body, { mtime, panel: { section: 'about' } }),
    dir('experience', cv.experience.map(e => experienceDir(e, mtime)), { mtime, panel: { section: 'experience' } }),
    dir('projects', cv.projects.map(p => projectDir(p, mtime)), { mtime, panel: { section: 'projects' } }),
    file('skills.json', `${JSON.stringify(cv.skills, null, 2)}\n`, { mtime, panel: { section: 'skills' } }),
    file('education.md', educationMarkdown(cv), { mtime, panel: { section: 'education' } }),
    file('contact.sh', contactScript(cv), { mtime, exec: true, panel: { section: 'contact' } }),
    file('.secrets', cv.secrets.body, { mtime, mode: 0o600 }),
  ], { mtime, panel: { section: 'top' } })

  return dir('', [dir('home', [home], { mtime })], { mtime })
}
