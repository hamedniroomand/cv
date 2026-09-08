export type PanelSection =
  | 'top'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'contact'
  | 'dotfiles';

export interface PanelTarget {
  section: PanelSection;
  slug?: string;
}

const SLUG_PREFIXES: Partial<Record<PanelSection, string>> = {
  experience: 'exp',
  projects: 'project',
  dotfiles: 'dotfile',
};

export const DOTFILES_INDEX = '/dotfiles';
export const RESUME_PATH = '/cv';

export function dotfilePath(slug: string): string {
  return `${DOTFILES_INDEX}/${slug}`;
}

export function projectPath(slug: string): string {
  return `/projects/${slug}`;
}

export function panelTargetId(target: PanelTarget): string {
  const prefix = target.slug ? SLUG_PREFIXES[target.section] : undefined;
  return prefix ? `${prefix}-${target.slug}` : target.section;
}

/** Public projects and dotfiles have pages; career content lives on `/cv`. */
export function panelRoute(target: PanelTarget): string {
  if (target.section === 'dotfiles') return target.slug ? dotfilePath(target.slug) : DOTFILES_INDEX;
  if (target.section === 'projects') return target.slug ? projectPath(target.slug) : '/';
  if (target.section === 'contact') return '/';
  return RESUME_PATH;
}

/**
 * The public page for a panel target, or null if the public site has no page for it.
 * The public terminal uses this to open a page. If the result is null, the terminal
 * keeps the page and the scroll position that the visitor chose.
 */
export function publicPanelRoute(target: PanelTarget): string | null {
  if (target.section === 'dotfiles') return target.slug ? dotfilePath(target.slug) : DOTFILES_INDEX;
  if (target.section === 'projects' && target.slug) return projectPath(target.slug);
  return null;
}
