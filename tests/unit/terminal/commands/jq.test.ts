import { describe, expect, it } from 'vitest'
import { makeShell } from '~~/tests/unit/fixtures/context'
import { commands } from '~/terminal/commands'

describe('jq', () => {
  it('filters JSON from pipeline input', async () => {
    const term = makeShell(commands)
    expect((await term.exec('cat skills.json | jq ".categories[] | .id"')).code).toBe(0)
    expect(term.text()).toBe('"frontend"\n"backend"')
  })

  it('prints string outputs raw with -r', async () => {
    const term = makeShell(commands)
    expect((await term.exec('cat skills.json | jq -r ".categories[] | .id"')).code).toBe(0)
    expect(term.text()).toBe('frontend\nbackend')
  })

  it('prints compact JSON with -c', async () => {
    const term = makeShell(commands)
    expect((await term.exec('jq -c ".categories[0]" skills.json')).code).toBe(0)
    expect(term.text()).toBe('{"id":"frontend","label":"Frontend","items":[{"name":"Vue 3"},{"name":"Nuxt 4"}]}')
  })

  it('reports invalid JSON as a parse error', async () => {
    const term = makeShell(commands)
    expect((await term.exec('cat about.md | jq .')).code).toBe(2)
    expect(term.text()).toMatch(/^jq: parse error: /)
  })

  it('shows usage without stdin or a file', async () => {
    const term = makeShell(commands)
    expect((await term.exec('jq')).code).toBe(2)
    expect(term.text()).toMatch(/^usage: jq/)
    const filterOnly = makeShell(commands)
    expect((await filterOnly.exec('jq .')).code).toBe(2)
    expect(filterOnly.text()).toMatch(/^usage: jq/)
  })

  it('reports missing files', async () => {
    const term = makeShell(commands)
    expect((await term.exec('jq . nope.json')).code).toBe(1)
    expect(term.text()).toBe('jq: nope.json: No such file or directory')
  })

  it('reads JSON from a named file', async () => {
    const term = makeShell(commands)
    expect((await term.exec('jq .profile.name skills.json')).code).toBe(0)
    expect(term.text()).toBe('null')
  })

  it('reports invalid filters separately from invalid JSON', async () => {
    const term = makeShell(commands)
    expect((await term.exec('jq "map(.id)" skills.json')).code).toBe(3)
    expect(term.text()).toMatch(/^jq: error: /)
  })

  it('reports filter runtime errors with exit code 3', async () => {
    const term = makeShell(commands)
    expect((await term.exec('echo 1 | jq .name')).code).toBe(3)
    expect(term.text()).toBe('jq: error: Cannot index number with "name"')
  })
})
