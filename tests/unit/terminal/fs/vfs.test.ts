import { describe, expect, it } from 'vitest'
import { FsError } from '~/terminal/fs/errors'
import { dir, file, Vfs } from '~/terminal/fs/vfs'

function make() {
  const root = dir('', [
    dir('home', [
      dir('hamed', [
        file('about.md', 'hello'),
        file('.secrets', 'shh', { mode: 0o600 }),
        dir('experience', [dir('thales', [file('README.md', 'T')])]),
      ]),
    ]),
  ])
  return new Vfs(root, { home: '/home/hamed' })
}

describe('resolve', () => {
  const fs = make()
  it('resolves ~ and relative paths', () => {
    expect(fs.resolve('~')).toBe('/home/hamed')
    expect(fs.resolve('~/experience')).toBe('/home/hamed/experience')
    expect(fs.resolve('experience/thales')).toBe('/home/hamed/experience/thales')
    expect(fs.resolve('./experience/../about.md')).toBe('/home/hamed/about.md')
    expect(fs.resolve('/home//hamed/')).toBe('/home/hamed')
    expect(fs.resolve('..', '/home/hamed')).toBe('/home')
    expect(fs.resolve('../../..')).toBe('/')
    expect(fs.resolve('')).toBe('/home/hamed')
  })
  it('displays home as ~', () => {
    expect(fs.display('/home/hamed')).toBe('~')
    expect(fs.display('/home/hamed/experience')).toBe('~/experience')
    expect(fs.display('/home')).toBe('/home')
  })
})

describe('stat/readFile/readdir', () => {
  const fs = make()
  it('stats files and dirs', () => {
    expect(fs.stat('about.md').type).toBe('file')
    expect(fs.stat('experience').type).toBe('dir')
    expect(fs.stat('/').type).toBe('dir')
    expect(fs.exists('about.md')).toBe(true)
    expect(fs.exists('zzz')).toBe(false)
  })
  it('throws ENOENT', () => {
    expect(() => fs.stat('nope')).toThrowError(FsError)
    expect(() => fs.stat('nope')).toThrow(expect.objectContaining({ code: 'ENOENT', path: 'nope' }))
    expect(() => fs.stat('about.md/x')).toThrow(expect.objectContaining({ code: 'ENOTDIR' }))
  })
  it('reads files, refuses dirs', () => {
    expect(fs.readFile('about.md')).toBe('hello')
    expect(() => fs.readFile('experience')).toThrow(expect.objectContaining({ code: 'EISDIR' }))
  })
  it('enforces 0600 unless sudo', () => {
    expect(() => fs.readFile('.secrets')).toThrow(expect.objectContaining({ code: 'EACCES' }))
    expect(fs.readFile('.secrets', { sudo: true })).toBe('shh')
  })
  it('hides dotfiles unless all', () => {
    expect(fs.readdir('.').map(n => n.name)).toEqual(['about.md', 'experience'])
    expect(fs.readdir('.', { all: true }).map(n => n.name)).toEqual(['.secrets', 'about.md', 'experience'])
  })
  it('readdir on a file throws ENOTDIR', () => {
    expect(() => fs.readdir('about.md')).toThrow(expect.objectContaining({ code: 'ENOTDIR' }))
  })
  it('exposes size in bytes', () => {
    expect(fs.stat('about.md').type === 'file' && (fs.stat('about.md') as { size: number }).size).toBe(5)
  })
})

describe('chdir/walk/complete', () => {
  it('changes directory', () => {
    const fs = make()
    fs.chdir('experience')
    expect(fs.cwd).toBe('/home/hamed/experience')
    expect(() => fs.chdir('README.md')).toThrow(expect.objectContaining({ code: 'ENOENT' }))
    fs.chdir('thales')
    expect(() => fs.chdir('README.md')).toThrow(expect.objectContaining({ code: 'ENOTDIR' }))
    fs.chdir('~')
    expect(fs.cwd).toBe('/home/hamed')
  })
  it('walks depth-first including the root of the walk', () => {
    const fs = make()
    const seen: string[] = []
    fs.walk('~', p => seen.push(p))
    expect(seen).toEqual([
      '/home/hamed',
      '/home/hamed/.secrets',
      '/home/hamed/about.md',
      '/home/hamed/experience',
      '/home/hamed/experience/thales',
      '/home/hamed/experience/thales/README.md',
    ])
  })
  it('completes paths', () => {
    const fs = make()
    expect(fs.complete('ex')).toEqual(['experience/'])
    expect(fs.complete('experience/th')).toEqual(['experience/thales/'])
    expect(fs.complete('a', { dirsOnly: true })).toEqual([])
    expect(fs.complete('.')).toEqual(['.secrets'])
    expect(fs.complete('')).toEqual(['about.md', 'experience/'])
    expect(fs.complete('~/ex')).toEqual(['~/experience/'])
    expect(fs.complete('zzz/')).toEqual([])
  })
})
