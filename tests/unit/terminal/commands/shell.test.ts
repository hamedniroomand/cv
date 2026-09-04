import { describe, expect, it } from 'vitest'
import { makeShell } from '~~/tests/unit/fixtures/context'
import { fixtureCv } from '~~/tests/unit/fixtures/cv'
import { commands } from '~/terminal/commands'
import { completeLine } from '~/terminal/shell/completion'

describe('help', () => {
  it('lists visible commands with descriptions', async () => {
    const term = makeShell(commands)
    await term.exec('help')
    expect(term.text()).toMatch(/^ls {8}List directory contents$/m)
    expect(term.text()).toMatch(/^cat {7}/m)
    expect(term.text()).not.toMatch(/^sudo/m)
  })

  it('shows usage for one command', async () => {
    const term = makeShell(commands)
    await term.exec('help ls')
    expect(term.text()).toContain('usage: ls [-la] [path...]')
  })

  it('errors for unknown commands', async () => {
    const term = makeShell(commands)
    expect((await term.exec('help nope')).code).toBe(1)
    expect(term.text()).toBe('help: no such command: nope')
  })

  it('completes command names', () => {
    const term = makeShell(commands)
    const ctx = term.completion
    expect(completeLine('help l', ctx).candidates).toContain('ls')
  })
})

describe('clear / history / date', () => {
  it('clear calls ui.clear', async () => {
    const term = makeShell(commands)
    await term.exec('clear')
    expect(term.calls.cleared).toBe(1)
  })

  it('history numbers entries', async () => {
    const term = makeShell(commands, { history: ['ls', 'cat about.md'] })
    await term.exec('history')
    expect(term.text()).toBe('   1  ls\n   2  cat about.md')
  })

  it('date prints a date', async () => {
    const term = makeShell(commands)
    await term.exec('date')
    expect(term.text()).toMatch(/\d{4}/)
  })
})

describe('man', () => {
  it('man hamed renders a manual page', async () => {
    const term = makeShell(commands)
    await term.exec('man hamed')
    const out = term.text()
    expect(out).toContain('HAMED(1)')
    for (const section of ['NAME', 'SYNOPSIS', 'DESCRIPTION', 'OPTIONS', 'SEE ALSO'])
      expect(out).toMatch(new RegExp(`^${section}$`, 'm'))
    expect(out).toContain('--frontend')
  })

  it('man <command> shows usage', async () => {
    const term = makeShell(commands)
    await term.exec('man ls')
    expect(term.text()).toContain('ls [-la] [path...]')
  })

  it('errors otherwise', async () => {
    const term = makeShell(commands)
    expect((await term.exec('man zzz')).code).toBe(1)
    expect((await term.exec('man')).code).toBe(1)
    expect(term.text()).toBe('No manual entry for zzz\nWhat manual page do you want?')
  })

  it('completes pages', () => {
    const term = makeShell(commands)
    const ctx = term.completion
    expect(completeLine('man ha', ctx)).toEqual({ line: 'man hamed ', candidates: ['hamed'] })
  })

  it('wraps long synopsis lines', async () => {
    const long = 'word '.repeat(40).trim()
    const term = makeShell(commands, {
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
    expect((await term.exec('man hamed')).code).toBe(0)
    expect(term.text().split('\n').length).toBeGreaterThan(20)
  })

  it('skips current-role line without experience', async () => {
    const term = makeShell(commands, {
      cv: { ...fixtureCv, experience: [], profile: { ...fixtureCv.profile, summary: '' } },
    })
    expect((await term.exec('man hamed')).code).toBe(0)
    expect(term.text()).not.toContain('Currently:')
  })
})
