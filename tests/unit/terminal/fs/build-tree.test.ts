import { describe, expect, it } from 'vitest'
import { buildTree, HOME } from '#shared/cv/build-tree'
import { Vfs } from '~/terminal/fs/vfs'
import { fixtureCv } from '../../fixtures/cv'

describe('buildTree', () => {
  const fs = new Vfs(buildTree(fixtureCv), { home: HOME })
  it('lays out the home directory', () => {
    expect(fs.readdir('~', { all: true }).map(n => n.name)).toEqual([
      '.secrets',
      'about.md',
      'contact.sh',
      'education.md',
      'experience',
      'projects',
      'skills.json',
    ])
    expect(fs.readdir('~/experience').map(n => n.name)).toEqual(['acme', 'globex'])
    expect(fs.readdir('~/experience/acme').map(n => n.name)).toEqual(['README.md', 'highlights'])
    expect(fs.readdir('~/experience/acme/highlights').map(n => n.name)).toEqual(['shipped.md'])
    expect(fs.readdir('~/experience/globex').map(n => n.name)).toEqual(['README.md'])
    expect(fs.readdir('~/projects/cue').map(n => n.name)).toEqual(['README.md'])
  })
  it('marks .secrets 0600 and contact.sh executable', () => {
    expect(fs.stat('~/.secrets').mode).toBe(0o600)
    const contact = fs.stat('~/contact.sh')
    expect(contact.type === 'file' && contact.exec).toBe(true)
    expect(fs.readFile('~/contact.sh')).toContain('me@example.com')
  })
  it('stamps panel targets', () => {
    expect(fs.stat('~/about.md').panel).toEqual({ section: 'about' })
    expect(fs.stat('~/experience').panel).toEqual({ section: 'experience' })
    expect(fs.stat('~/experience/acme').panel).toEqual({ section: 'experience', slug: 'acme' })
    expect(fs.stat('~/experience/acme/highlights/shipped.md').panel).toEqual({ section: 'experience', slug: 'acme' })
    expect(fs.stat('~/projects/cue/README.md').panel).toEqual({ section: 'projects', slug: 'cue' })
    expect(fs.stat('~/skills.json').panel).toEqual({ section: 'skills' })
    expect(fs.stat('~/education.md').panel).toEqual({ section: 'education' })
    expect(fs.stat('~/contact.sh').panel).toEqual({ section: 'contact' })
    expect(fs.stat('~').panel).toEqual({ section: 'top' })
  })
  it('renders README with roles and stack', () => {
    const readme = fs.readFile('~/experience/acme/README.md')
    expect(readme).toMatch(/^# Acme/)
    expect(readme).toContain('Team Lead · Sep 2022 – Aug 2026')
    expect(readme).toContain('Stack: Vue 3, Nuxt 4')
    expect(readme).toContain('Acme builds widgets.')
  })
  it('renders highlight files with a heading', () => {
    expect(fs.readFile('~/experience/acme/highlights/shipped.md')).toBe('# Shipped the thing\n\nShipped the thing to production.')
  })
  it('skills.json is valid JSON matching the data', () => {
    expect(JSON.parse(fs.readFile('~/skills.json'))).toEqual(fixtureCv.skills)
  })
  it('uses generatedAt as mtime', () => {
    expect(fs.stat('~/about.md').mtime).toBe(fixtureCv.generatedAt)
  })
})
