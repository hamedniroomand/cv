import { describe, expect, it } from 'vitest'
import { parseFrontmatter } from '../../../modules/cv-content/frontmatter'

describe('parseFrontmatter', () => {
  it('splits yaml and body', () => {
    const r = parseFrontmatter('---\ntitle: Hi\norder: 2\n---\n\nBody **md**\n')
    expect(r.data).toEqual({ title: 'Hi', order: 2 })
    expect(r.body).toBe('Body **md**')
  })
  it('returns empty data without frontmatter', () => {
    expect(parseFrontmatter('just text')).toEqual({ data: {}, body: 'just text' })
  })
  it('handles CRLF and empty frontmatter', () => {
    expect(parseFrontmatter('---\r\n---\r\nx')).toEqual({ data: {}, body: 'x' })
  })
})
