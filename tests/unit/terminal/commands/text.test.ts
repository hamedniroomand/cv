import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'
import { fixtureCv } from '../../fixtures/cv'

describe('cat', () => {
  it('prints a file and navigates the panel', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('cat about.md')).code).toBe(0)
    expect(s.text()).toBe(fixtureCv.about.body)
    expect(s.calls.navigate).toEqual([{ section: 'about' }])
  })
  it('denies .secrets without sudo', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('cat .secrets')).code).toBe(1)
    expect(s.text()).toBe('cat: .secrets: Permission denied')
  })
  it('reads .secrets with sudo', async () => {
    const s = makeShell(commands)
    await s.shell.exec('sudo cat .secrets')
    expect(s.text()).toBe(fixtureCv.secrets.body)
  })
  it('rejects directories and missing files', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('cat experience')).code).toBe(1)
    expect((await s.shell.exec('cat nope')).code).toBe(1)
    expect(s.text()).toBe('cat: experience: Is a directory\ncat: nope: No such file or directory')
  })
  it('echoes stdin and shows usage without input', async () => {
    const s = makeShell(commands)
    await s.shell.exec('echo hi | cat')
    expect(s.text()).toBe('hi')
    const s2 = makeShell(commands)
    expect((await s2.shell.exec('cat')).code).toBe(1)
    expect(s2.text()).toMatch(/^usage: cat/)
  })
  it('works at the head of a pipeline', async () => {
    const s = makeShell(commands)
    await s.shell.exec('cat skills.json | head -n 1')
    expect(s.text()).toBe('{')
  })
})

describe('grep', () => {
  it('matches lines in a file and highlights the match', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('grep widgets experience/acme/README.md')).code).toBe(0)
    expect(s.text()).toBe('Acme builds widgets.')
    expect(s.lines[0]!.spans).toContainEqual({ text: 'widgets', style: 'accent' })
  })
  it('recurses with -r and prefixes paths', async () => {
    const s = makeShell(commands)
    await s.shell.exec('grep -r SEO experience')
    expect(s.text()).toBe('experience/globex/README.md:Globex does SEO.')
  })
  it('is case-insensitive with -i and regex-aware', async () => {
    const s = makeShell(commands)
    await s.shell.exec('grep -i "^ACME" experience/acme/README.md')
    expect(s.text()).toBe('Acme builds widgets.')
  })
  it('reads stdin when no file is given', async () => {
    const s = makeShell(commands)
    await s.shell.exec('cat about.md | grep two')
    expect(s.text()).toBe('About paragraph two.')
  })
  it('exits 1 without output when nothing matches', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('grep zzz about.md')).code).toBe(1)
    expect(s.lines).toEqual([])
  })
  it('shows usage without a pattern and skips unreadable files under -r', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('grep')).code).toBe(2)
    expect(s.text()).toMatch(/^usage: grep/)
    const s2 = makeShell(commands)
    expect((await s2.shell.exec('grep -r Secret .')).code).toBe(1)
  })
  it('falls back to a literal match on invalid regex', async () => {
    const s = makeShell(commands)
    await s.shell.exec('echo "a(b" | grep "a("')
    expect(s.text()).toBe('a(b')
  })
})

describe('head / tail', () => {
  it('default to 10 lines from stdin', async () => {
    const s = makeShell(commands)
    await s.shell.exec('cat skills.json | head')
    expect(s.lines).toHaveLength(10)
  })
  it('honour -n on files', async () => {
    const s = makeShell(commands)
    await s.shell.exec('head -n 1 about.md')
    await s.shell.exec('tail -n 1 about.md')
    expect(s.text()).toBe('About paragraph one.\nAbout paragraph two.')
  })
  it('report missing files', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('head nope')).code).toBe(1)
    expect(s.text()).toBe('head: nope: No such file or directory')
  })
  it('tail -n 2 returns the last two lines of stdin', async () => {
    const s = makeShell(commands)
    await s.shell.exec('echo "a\nb\nc" | tail -n 2')
    expect(s.text()).toBe('b\nc')
  })
})

describe('echo', () => {
  it('joins arguments', async () => {
    const s = makeShell(commands)
    await s.shell.exec('echo a  "b c"')
    expect(s.text()).toBe('a b c')
  })
  it('prints an empty line without args', async () => {
    const s = makeShell(commands)
    await s.shell.exec('echo')
    expect(s.lines).toHaveLength(1)
    expect(s.lines[0]!.spans).toEqual([])
  })
})
