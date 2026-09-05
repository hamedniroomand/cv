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

export function dotfilePath(slug: string): string {
  return `${DOTFILES_INDEX}/${slug}`;
}

export function panelTargetId(target: PanelTarget): string {
  const prefix = target.slug ? SLUG_PREFIXES[target.section] : undefined;
  return prefix ? `${prefix}-${target.slug}` : `section-${target.section}`;
}

/** The page a panel target lives on. Resume sections live on `/`. */
export function panelRoute(target: PanelTarget): string {
  if (target.section !== 'dotfiles') return '/';
  return target.slug ? dotfilePath(target.slug) : DOTFILES_INDEX;
}
