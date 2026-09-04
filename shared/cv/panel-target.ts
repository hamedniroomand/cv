export type PanelSection = 'top' | 'about' | 'experience' | 'projects' | 'skills' | 'education' | 'contact'

export interface PanelTarget {
  section: PanelSection
  slug?: string
}

const SLUG_PREFIXES: Partial<Record<PanelSection, string>> = {
  experience: 'exp',
  projects: 'project',
}

export function panelTargetId(target: PanelTarget): string {
  const prefix = target.slug ? SLUG_PREFIXES[target.section] : undefined
  return prefix ? `${prefix}-${target.slug}` : `section-${target.section}`
}
