import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../../modules/cv-content/load'

const dir = fileURLToPath(new URL('../../../content', import.meta.url))

describe('loadContent', () => {
  it('loads and validates the real content directory', async () => {
    const cv = await loadContent(dir, async () => null)
    expect(cv.profile.name).toBe('Hamed Niroomand')
    expect(cv.experience.map(e => e.slug)).toEqual(['jack-westin', 'thales', 'faro-creaform', 'joorchin', 'xankoo'])
    expect(cv.experience[0]!.highlights.map(h => h.slug)).toEqual(['team-lead', 'design-system', 'micro-frontends'])
    expect(cv.projects[0]!.readmeSource).toBe('fallback')
    expect(cv.skills.categories.length).toBeGreaterThan(3)
    expect(cv.secrets.body).toContain('vim')
  })
  it('uses the fetched README when available', async () => {
    const cv = await loadContent(dir, async () => '# Cue\n\nfrom github')
    expect(cv.projects[0]!.readmeSource).toBe('github')
    expect(cv.projects[0]!.body).toContain('from github')
    expect(cv.projects[0]!.html).toContain('<h1>')
  })
  it('renders markdown to html', async () => {
    const cv = await loadContent(dir, async () => null)
    expect(cv.about.html).toContain('<p>')
    expect(cv.experience[0]!.highlights[0]!.html).toContain('<p>')
  })
  it('stamps generatedAt from the clock', async () => {
    const cv = await loadContent(dir, async () => null, new Date('2026-09-04T00:00:00Z'))
    expect(cv.generatedAt).toBe('2026-09-04T00:00:00.000Z')
  })
})
