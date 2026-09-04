export type PanelSection = 'top' | 'about' | 'experience' | 'projects' | 'skills' | 'education' | 'contact'

export interface PanelTarget {
  section: PanelSection
  slug?: string
}

/** DOM id of the panel element a target points at. */
export function panelTargetId(target: PanelTarget): string {
  if (target.slug) {
    if (target.section === 'experience')
      return `exp-${target.slug}`
    if (target.section === 'projects')
      return `project-${target.slug}`
  }
  return `section-${target.section}`
}
