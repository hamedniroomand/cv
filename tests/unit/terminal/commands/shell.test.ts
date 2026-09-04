import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { completeLine } from '~/terminal/shell/completion'
import { makeShell } from '../../fixtures/context'
import { fixtureCv } from '../../fixtures/cv'

describe('help', () => {
  it('lists visible commands with descriptions', async () => {
    const s = makeShell(commands)
    await s.shell.exec('help')
    expect(s.text()).toMatch(/^ls {8}List directory contents$/m)
    expect(s.text()).toMatch(/^cat {7}/m)
    expect(s.text()).not.toMatch(/^sudo/m)
  })
  it('shows usage for one command', async () => {
    const s = makeShell(commands)
    await s.shell.exec('help ls')
    expect(s.text()).toContain('usage: ls [-la] [path...]')
  })
  it('errors for unknown commands', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('help nope')).code).toBe(1)
    expect(s.text()).toBe('help: no such command: nope')
  })
  it('completes command names', () => {
    const s = makeShell(commands)
    const ctx = { fs: s.deps.fs, registry: s.deps.registry, cv: s.deps.cv }
    expect(completeLine('help l', ctx).candidates).toContain('ls')
  })
})

describe('clear / history / date', () => {
  it('clear calls ui.clear', async () => {
    const s = makeShell(commands)
    await s.shell.exec('clear')
    expect(s.calls.cleared).toBe(1)
  })
  it('history numbers entries', async () => {
    const s = makeShell(commands, { history: ['ls', 'cat about.md'] })
    await s.shell.exec('history')
    expect(s.text()).toBe('   1  ls\n   2  cat about.md')
  })
  it('date prints a date', async () => {
    const s = makeShell(commands)
    await s.shell.exec('date')
    expect(s.text()).toMatch(/\d{4}/)
  })
})

describe('man', () => {
  it('man hamed renders a manual page', async () => {
    const s = makeShell(commands)
    await s.shell.exec('man hamed')
    const out = s.text()
    expect(out).toContain('HAMED(1)')
    for (const section of ['NAME', 'SYNOPSIS', 'DESCRIPTION', 'OPTIONS', 'SEE ALSO'])
      expect(out).toMatch(new RegExp(`^${section}$`, 'm'))
    expect(out).toContain('--frontend')
  })
  it('man <command> shows usage', async () => {
    const s = makeShell(commands)
    await s.shell.exec('man ls')
    expect(s.text()).toContain('ls [-la] [path...]')
  })
  it('errors otherwise', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('man zzz')).code).toBe(1)
    expect((await s.shell.exec('man')).code).toBe(1)
    expect(s.text()).toBe('No manual entry for zzz\nWhat manual page do you want?')
  })
  it('completes pages', () => {
    const s = makeShell(commands)
    const ctx = { fs: s.deps.fs, registry: s.deps.registry, cv: s.deps.cv }
    expect(completeLine('man ha', ctx)).toEqual({ line: 'man hamed ', candidates: ['hamed'] })
  })
  it('wraps long synopsis lines', async () => {
    const long = 'word '.repeat(40).trim()
    const s = makeShell(commands, {
      cv: {
        ...fixtureCv,
        profile: { ...fixtureCv.profile, summary: long },
        skills: {
          categories: [{
            id: 'frontend',
            label: 'Frontend',
            items: Array.from({ length: 20 }, (_, i) => ({ name: `Skill${i}Name` })),
          }],
        },
      },
    })
    expect((await s.shell.exec('man hamed')).code).toBe(0)
    expect(s.text().split('\n').length).toBeGreaterThan(20)
  })
  it('skips current-role line without experience', async () => {
    const s = makeShell(commands, {
      cv: { ...fixtureCv, experience: [], profile: { ...fixtureCv.profile, summary: '' } },
    })
    expect((await s.shell.exec('man hamed')).code).toBe(0)
    expect(s.text()).not.toContain('Currently:')
  })
})
