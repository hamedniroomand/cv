import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'

describe('jq', () => {
  it('filters JSON from pipeline input', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('cat skills.json | jq ".categories[] | .id"')).code).toBe(0)
    expect(s.text()).toBe('"frontend"\n"backend"')
  })

  it('prints string outputs raw with -r', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('cat skills.json | jq -r ".categories[] | .id"')).code).toBe(0)
    expect(s.text()).toBe('frontend\nbackend')
  })

  it('reports invalid JSON as a parse error', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('cat about.md | jq .')).code).toBe(2)
    expect(s.text()).toMatch(/^jq: parse error: /)
  })

  it('shows usage without stdin or a file', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('jq')).code).toBe(2)
    expect(s.text()).toMatch(/^usage: jq/)
  })

  it('reads JSON from a named file', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('jq .profile.name skills.json')).code).toBe(0)
    expect(s.text()).toBe('null')
  })

  it('reports invalid filters separately from invalid JSON', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('jq "map(.id)" skills.json')).code).toBe(3)
    expect(s.text()).toMatch(/^jq: error: /)
  })
})
