import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'

describe('wc', () => {
  it('counts lines from pipeline input', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('echo "a\nb\nc" | wc -l')).code).toBe(0)
    expect(s.text()).toBe('3')
  })

  it('counts lines in a file and labels the result', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('wc -l about.md')).code).toBe(0)
    expect(s.text()).toBe('3 about.md')
  })

  it('prints line, word, and byte counts by default', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('echo hi | wc')).code).toBe(0)
    expect(s.text()).toBe('      1       1       3')
  })

  it('reports missing files', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('wc nope')).code).toBe(1)
    expect(s.text()).toBe('wc: nope: No such file or directory')
  })
})
