import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'

describe('bat', () => {
  it('renders markdown with a dim file header and navigates the panel', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('bat projects/cue/README.md')).code).toBe(0)
    expect(s.lines[0]!.spans).toEqual([{ text: '── ~/projects/cue/README.md', style: 'dim' }])
    expect(s.lines[1]!.spans).toEqual([{ text: 'Cue', style: 'accent' }])
    expect(s.text()).toBe('── ~/projects/cue/README.md\nCue\n\nFallback readme.')
    expect(s.calls.navigate).toEqual([{ section: 'projects', slug: 'cue' }])
  })
  it('prints non-markdown files as plain text', async () => {
    const s = makeShell(commands)
    await s.shell.exec('bat skills.json | head -n 1')
    expect(s.text()).toBe('{')
  })
  it('reports errors like cat does', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('bat nope')).code).toBe(1)
    expect(s.text()).toBe('bat: nope: No such file or directory')
    expect((await s.shell.exec('bat')).code).toBe(1)
  })
  it('respects sudo on .secrets', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('bat .secrets')).code).toBe(1)
    expect((await s.shell.exec('sudo bat .secrets')).code).toBe(0)
  })
})
