import { githubUrl } from './links.ts';

export type ProjectActionKind = 'site' | 'docs' | 'repo';
export type ProjectActionVariant = 'primary' | 'secondary';

export interface ProjectAction {
  kind: ProjectActionKind;
  href: string;
  label: string;
  variant: ProjectActionVariant;
}

/** The parts of a project that become links on the project page. */
export interface LinkableProject {
  name: string;
  site?: string;
  docs?: string;
  repo?: string;
}

/**
 * Puts the links of a project page in order.
 * The link that lets a visitor use the project is first, and it is the primary link.
 * The link to the repository is last, because fewer visitors want the source code.
 */
export function projectActions(project: LinkableProject): ProjectAction[] {
  const actions: ProjectAction[] = [];
  const add = (kind: ProjectActionKind, href: string, label: string): void => {
    actions.push({ kind, href, label, variant: actions.length === 0 ? 'primary' : 'secondary' });
  };
  if (project.site) add('site', project.site, `Visit ${project.name}`);
  if (project.docs) add('docs', project.docs, 'Documentation');
  if (project.repo) add('repo', githubUrl(project.repo), 'View on GitHub');
  return actions;
}

/** The text under SOURCE on the project page. A repository is public. Everything else is private. */
export function projectSourceLabel(project: { repo?: string; site?: string }): string {
  return project.repo ? 'Open source' : 'Private source';
}
