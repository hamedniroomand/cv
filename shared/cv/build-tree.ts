import type { CvData } from '#shared/schemas/cv';
import type { Dotfile } from '#shared/schemas/dotfile';
import type { Experience } from '#shared/schemas/experience';
import type { Project } from '#shared/schemas/project';
import type { FsDir, FsNode } from '~/terminal/fs/types';
import { dir, file } from '~/terminal/fs/vfs';

import { splitDotfilePath } from './dotfiles';
import { formatRange } from './format';
import { githubUrl } from './links';
import type { PanelTarget } from './panel-target';

export const HOME = '/home/hamed';

function experienceReadme(experience: Experience): string {
  const roles = [...experience.roles]
    .sort((a, b) => b.start.localeCompare(a.start))
    .map(role => `${role.title} · ${formatRange(role.start, role.end)}`);
  return [
    `# ${experience.company}`,
    ...roles,
    `Location: ${experience.location} · ${experience.type}`,
    `Stack: ${experience.stack.join(', ')}`,
    '',
    experience.body,
  ].join('\n');
}

function highlightsDir(experience: Experience, mtime: string, panel: PanelTarget): FsDir {
  const files = experience.highlights.map(highlight =>
    file(`${highlight.slug}.md`, `# ${highlight.title}\n\n${highlight.body}`, { mtime, panel }),
  );
  return dir('highlights', files, { mtime, panel });
}

function experienceDir(experience: Experience, mtime: string): FsDir {
  const panel: PanelTarget = { section: 'experience', slug: experience.slug };
  const children: FsNode[] = [file('README.md', experienceReadme(experience), { mtime, panel })];
  if (experience.highlights.length > 0) children.push(highlightsDir(experience, mtime, panel));
  return dir(experience.slug, children, { mtime, panel });
}

function projectDir(project: Project, mtime: string): FsDir {
  const panel: PanelTarget = { section: 'projects', slug: project.slug };
  return dir(project.slug, [file('README.md', project.body, { mtime, panel })], { mtime, panel });
}

function contactScript(cv: CvData): string {
  const { links } = cv.profile;
  return [
    '#!/bin/sh',
    '# Run `contact` to open the contact form, or reach me directly:',
    `echo "email:    ${links.email}"`,
    `echo "github:   ${githubUrl(links.github)}"`,
    `echo "linkedin: ${links.linkedin}"`,
    '',
  ].join('\n');
}

function educationMarkdown(cv: CvData): string {
  const { education } = cv;
  return [
    `# ${education.degree} ${education.field}`,
    `${education.institution} · ${education.location}`,
    formatRange(education.start, education.end),
    '',
    education.body,
  ].join('\n');
}

function ensureDir(parent: FsDir, name: string, mtime: string, panel: PanelTarget): FsDir {
  const existing = parent.children.get(name);
  if (existing?.type === 'dir') return existing;
  if (existing) throw new Error(`dotfile path collides with existing file ${name}`);
  const created = dir(name, [], { mtime, panel });
  parent.children.set(name, created);
  return created;
}

export function mountDotfiles(home: FsDir, dotfiles: Dotfile[], mtime: string): void {
  for (const dotfile of dotfiles) {
    const { dirs, name } = splitDotfilePath(dotfile.path);
    let parent = home;
    for (const segment of dirs) parent = ensureDir(parent, segment, mtime, { section: 'dotfiles' });
    if (parent.children.has(name))
      throw new Error(`dotfile path collides with existing file ${name}`);
    parent.children.set(
      name,
      file(name, dotfile.content, { mtime, panel: { section: 'dotfiles', slug: dotfile.slug } }),
    );
  }
}

function homeDir(cv: CvData, mtime: string): FsDir {
  const home = dir(
    'hamed',
    [
      file('about.md', cv.about.body, { mtime, panel: { section: 'about' } }),
      dir(
        'experience',
        cv.experience.map(entry => experienceDir(entry, mtime)),
        { mtime, panel: { section: 'experience' } },
      ),
      dir(
        'projects',
        cv.projects.map(project => projectDir(project, mtime)),
        { mtime, panel: { section: 'projects' } },
      ),
      file('skills.json', `${JSON.stringify(cv.skills, null, 2)}\n`, {
        mtime,
        panel: { section: 'skills' },
      }),
      file('education.md', educationMarkdown(cv), { mtime, panel: { section: 'education' } }),
      file('contact.sh', contactScript(cv), { mtime, exec: true, panel: { section: 'contact' } }),
      file('.secrets', cv.secrets.body, { mtime, mode: 0o600 }),
    ],
    { mtime, panel: { section: 'top' } },
  );
  mountDotfiles(home, cv.dotfiles, mtime);
  return home;
}

export function buildTree(cv: CvData): FsDir {
  const mtime = cv.generatedAt;
  return dir('', [dir('home', [homeDir(cv, mtime)], { mtime })], { mtime });
}
