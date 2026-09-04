import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { completeLine } from '~/terminal/shell/completion'
import { makeShell } from '../../fixtures/context'
import { fixtureCv } from '../../fixtures/cv'

const HIDDEN = ['hire-me', 'vim', 'nano', 'emacs', 'rm']

describe('hire-me', () => {
  it('refuses without sudo', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('hire-me')).code).toBe(1)
    expect(s.text()).toBe('hire-me: permission denied. Try: sudo hire-me')
    expect(s.calls.modals).toEqual([])
  })

  it('opens the hire modal with sudo and prints nothing', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('sudo hire-me')).code).toBe(0)
    expect(s.calls.modals).toEqual(['hire'])
    expect(s.text()).toBe('')
  })
})

describe('emacs', () => {
  it('declines, on stdout, with a failing exit code', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('emacs')).code).toBe(1)
    expect(s.text()).toBe('Not on my machine.')
    expect(s.lines[0]?.spans[0]?.style).toBeUndefined()
  })
})

describe('rm', () => {
  it.each(['rm -rf /', 'rm -rf /*', 'rm -rf ~', 'rm -fr /', 'rm -r -f /'])('%s destroys the page', async (line) => {
    const s = makeShell(commands)

    expect((await s.shell.exec(line)).code).toBe(0)
    expect(s.text()).toBe('rm: it\'s your funeral.')
    expect(s.calls.destroyed).toBe(1)
  })

  it('refuses every other target', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('rm foo')).code).toBe(1)
    expect(s.text()).toBe('rm: cannot remove \'foo\': Read-only file system')
    expect(s.lines[0]?.spans[0]?.style).toBe('error')
    expect(s.calls.destroyed).toBe(0)
  })

  it('reports every operand it refuses', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('rm -rf about.md skills.json')).code).toBe(1)
    expect(s.text()).toBe('rm: cannot remove \'about.md\': Read-only file system\nrm: cannot remove \'skills.json\': Read-only file system')
    expect(s.calls.destroyed).toBe(0)
  })

  it('needs both -r and -f to reach the funeral', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('rm -f /')).code).toBe(1)
    expect(s.text()).toBe('rm: cannot remove \'/\': Read-only file system')
    expect(s.calls.destroyed).toBe(0)
  })

  it('prints usage without an operand', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('rm -rf')).code).toBe(1)
    expect(s.text()).toBe('usage: rm [-rf] <file>...')
    expect(s.calls.destroyed).toBe(0)
  })
})

describe('vim and nano', () => {
  it('opens a readable file read-only in the editor modal', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('vim about.md')).code).toBe(0)
    expect(s.calls.modals).toEqual(['editor'])
    expect(s.calls.modalProps).toEqual([{ kind: 'vim', path: 'about.md', content: fixtureCv.about.body }])
    expect(s.text()).toBe('')
  })

  it('opens nano with its own kind', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('nano ~/skills.json')).code).toBe(0)
    expect(s.calls.modalProps).toEqual([{ kind: 'nano', path: '~/skills.json', content: `${JSON.stringify(fixtureCv.skills, null, 2)}\n` }])
  })

  it('opens an empty buffer for a missing file', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('vim notes.txt')).code).toBe(0)
    expect(s.calls.modalProps).toEqual([{ kind: 'vim', path: 'notes.txt', content: null }])
  })

  it('honours the same permission rules as cat', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('vim ~/.secrets')).code).toBe(1)
    expect(s.text()).toBe('vim: ~/.secrets: Permission denied')
    expect(s.calls.modals).toEqual([])
  })

  it('opens protected files under sudo', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('sudo nano ~/.secrets')).code).toBe(0)
    expect(s.calls.modalProps).toEqual([{ kind: 'nano', path: '~/.secrets', content: fixtureCv.secrets.body }])
  })

  it('refuses a directory', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('vim ~/projects')).code).toBe(1)
    expect(s.text()).toBe('vim: ~/projects: Is a directory')
    expect(s.calls.modals).toEqual([])
  })

  it('prints usage without a file', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('nano')).code).toBe(1)
    expect(s.text()).toBe('usage: nano <file>')
    expect(s.calls.modals).toEqual([])
  })
})

describe('hidden commands', () => {
  it('run but stay out of help', async () => {
    const s = makeShell(commands)

    await s.shell.exec('help')
    const listed = s.lines.map(l => l.spans[0]).filter(span => span?.style === 'accent').map(span => span!.text.trim())

    expect(listed).toContain('cat')
    for (const name of HIDDEN) {
      expect(s.deps.registry.get(name), name).toBeDefined()
      expect(listed, name).not.toContain(name)
    }
  })

  it('stay out of tab completion', () => {
    const s = makeShell(commands)
    const ctx = { fs: s.deps.fs, registry: s.deps.registry, cv: s.deps.cv }

    for (const name of HIDDEN)
      expect(completeLine(name.slice(0, 2), ctx).candidates, name).not.toContain(name)
  })
})
