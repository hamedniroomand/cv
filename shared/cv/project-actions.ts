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
  const actions: Omit<ProjectAction, 'variant'>[] = [];
  if (project.site)
    actions.push({ kind: 'site', href: project.site, label: `Visit ${project.name}` });
  if (project.docs) actions.push({ kind: 'docs', href: project.docs, label: 'Documentation' });
  if (project.repo)
    actions.push({ kind: 'repo', href: githubUrl(project.repo), label: 'View on GitHub' });

  return actions.map((action, index) => ({
    kind: action.kind,
    href: action.href,
    label: action.label,
    variant: index === 0 ? 'primary' : 'secondary',
  }));
}
