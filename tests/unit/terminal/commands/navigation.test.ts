import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { completeLine } from '~/terminal/shell/completion'
import { makeShell } from '../../fixtures/context'

describe('ls', () => {
  it('lists the cwd on one line with dirs suffixed', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('ls')).code).toBe(0)
    expect(s.text()).toBe('about.md  contact.sh  education.md  experience/  projects/  skills.json')
    expect(s.lines[0]!.spans.find(sp => sp.text === 'experience/')?.style).toBe('accent')
    expect(s.calls.navigate).toEqual([])
  })
  it('shows dotfiles with -a and long format with -l', async () => {
    const s = makeShell(commands)
    await s.shell.exec('ls -la')
    const out = s.text()
    expect(out).toMatch(/^-rw------- {2}1 hamed hamed +\d+ \w{3} +\d{1,2} \d{4} \.secrets$/m)
    expect(out).toMatch(/^drwxr-xr-x .* experience$/m)
    expect(out).toMatch(/^-rwxr-xr-x .* contact\.sh$/m)
    expect(out).toMatch(/^-rw-r--r-- .* about\.md$/m)
  })
  it('lists a path and navigates the panel', async () => {
    const s = makeShell(commands)
    await s.shell.exec('ls experience/acme')
    expect(s.text()).toBe('README.md  highlights/')
    expect(s.calls.navigate).toEqual([{ section: 'experience', slug: 'acme' }])
  })
  it('prints a single file name', async () => {
    const s = makeShell(commands)
    await s.shell.exec('ls about.md')
    expect(s.text()).toBe('about.md')
  })
  it('prints headers for multiple paths', async () => {
    const s = makeShell(commands)
    await s.shell.exec('ls experience projects')
    expect(s.text()).toBe('experience:\nacme/  globex/\n\nprojects:\ncue/')
  })
  it('reports missing paths with exit 2', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('ls nope')).code).toBe(2)
    expect(s.text()).toBe('ls: cannot access \'nope\': No such file or directory')
  })
})

describe('cd / pwd', () => {
  it('changes directory and navigates', async () => {
    const s = makeShell(commands)
    await s.shell.exec('cd experience/acme')
    await s.shell.exec('pwd')
    expect(s.text()).toBe('/home/hamed/experience/acme')
    expect(s.calls.navigate).toEqual([{ section: 'experience', slug: 'acme' }])
  })
  it('cd without args goes home', async () => {
    const s = makeShell(commands)
    await s.shell.exec('cd experience')
    await s.shell.exec('cd')
    expect(s.deps.fs.cwd).toBe('/home/hamed')
  })
  it('reports errors', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('cd nope')).code).toBe(1)
    expect((await s.shell.exec('cd about.md')).code).toBe(1)
    expect(s.text()).toBe('cd: nope: No such file or directory\ncd: about.md: Not a directory')
  })
  it('completes directories only', () => {
    const s = makeShell(commands)
    const ctx = { fs: s.deps.fs, registry: s.deps.registry, cv: s.deps.cv }
    expect(completeLine('cd exp', ctx).line).toBe('cd experience/')
  })
})

describe('tree', () => {
  it('draws the tree with a summary', async () => {
    const s = makeShell(commands)
    await s.shell.exec('tree experience')
    expect(s.text()).toBe([
      'experience',
      '├── acme',
      '│   ├── README.md',
      '│   └── highlights',
      '│       └── shipped.md',
      '└── globex',
      '    └── README.md',
      '',
      '3 directories, 3 files',
    ].join('\n'))
  })
  it('defaults to the cwd and hides dotfiles', async () => {
    const s = makeShell(commands)
    await s.shell.exec('tree')
    expect(s.text()).toMatch(/^\./)
    expect(s.text()).not.toContain('.secrets')
  })
  it('errors on missing paths', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('tree nope')).code).toBe(1)
    expect(s.text()).toBe('tree: nope: No such file or directory')
  })
  it('prints a single file without walking', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('tree about.md')).code).toBe(0)
    expect(s.text()).toBe('about.md\n\n0 directories, 1 file')
  })
  it('completes directories', () => {
    const s = makeShell(commands)
    expect(completeLine('tree exp', { fs: s.deps.fs, registry: s.deps.registry, cv: s.deps.cv }).line).toBe('tree experience/')
  })
})
