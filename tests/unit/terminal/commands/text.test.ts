import { describe, expect, it } from 'vitest'
import { makeShell } from '~~/tests/unit/fixtures/context'
import { fixtureCv } from '~~/tests/unit/fixtures/cv'
import { commands } from '~/terminal/commands'

describe('cat', () => {
  it('prints a file and navigates the panel', async () => {
    const term = makeShell(commands)
    expect((await term.exec('cat about.md')).code).toBe(0)
    expect(term.text()).toBe(`${fixtureCv.about.body}\ntip: bat about.md renders this as formatted text`)
    expect(term.lines.at(-1)!.spans).toEqual([{ text: 'tip: bat about.md renders this as formatted text', style: 'dim' }])
    expect(term.calls.navigate).toEqual([{ section: 'about' }])
  })

  it('keeps the bat tip out of pipes and off non-markdown files', async () => {
    const term = makeShell(commands)
    await term.exec('cat about.md | tail -n 1')
    expect(term.text()).toBe('About paragraph two.')
    const other = makeShell(commands)
    await other.exec('cat contact.sh')
    expect(other.text()).not.toContain('tip:')
  })

  it('denies .secrets without sudo', async () => {
    const term = makeShell(commands)
    expect((await term.exec('cat .secrets')).code).toBe(1)
    expect(term.text()).toBe('cat: .secrets: Permission denied')
  })

  it('reads .secrets with sudo', async () => {
    const term = makeShell(commands)
    await term.exec('sudo cat .secrets')
    expect(term.text()).toBe(fixtureCv.secrets.body)
  })

  it('rejects directories and missing files', async () => {
    const term = makeShell(commands)
    expect((await term.exec('cat experience')).code).toBe(1)
    expect((await term.exec('cat nope')).code).toBe(1)
    expect(term.text()).toBe('cat: experience: Is a directory\ncat: nope: No such file or directory')
  })

  it('echoes stdin and shows usage without input', async () => {
    const term = makeShell(commands)
    await term.exec('echo hi | cat')
    expect(term.text()).toBe('hi')
    const other = makeShell(commands)
    expect((await other.exec('cat')).code).toBe(1)
    expect(other.text()).toMatch(/^usage: cat/)
  })

  it('works at the head of a pipeline', async () => {
    const term = makeShell(commands)
    await term.exec('cat skills.json | head -n 1')
    expect(term.text()).toBe('{')
  })
})

describe('grep', () => {
  it('matches lines in a file and highlights the match', async () => {
    const term = makeShell(commands)
    expect((await term.exec('grep widgets experience/acme/README.md')).code).toBe(0)
    expect(term.text()).toBe('Acme builds widgets.')
    expect(term.lines[0]!.spans).toContainEqual({ text: 'widgets', style: 'accent' })
  })

  it('recurses with -r and prefixes paths', async () => {
    const term = makeShell(commands)
    await term.exec('grep -r SEO experience')
    expect(term.text()).toBe('experience/globex/README.md:Globex does SEO.')
  })

  it('is case-insensitive with -i and regex-aware', async () => {
    const term = makeShell(commands)
    await term.exec('grep -i "^ACME" experience/acme/README.md')
    expect(term.text()).toBe('Acme builds widgets.')
  })

  it('reads stdin when no file is given', async () => {
    const term = makeShell(commands)
    await term.exec('cat about.md | grep two')
    expect(term.text()).toBe('About paragraph two.')
  })

  it('exits 1 without output when nothing matches', async () => {
    const term = makeShell(commands)
    expect((await term.exec('grep zzz about.md')).code).toBe(1)
    expect(term.lines).toEqual([])
  })

  it('shows usage without a pattern and skips unreadable files under -r', async () => {
    const term = makeShell(commands)
    expect((await term.exec('grep')).code).toBe(2)
    expect(term.text()).toMatch(/^usage: grep/)
    const other = makeShell(commands)
    expect((await other.exec('grep -r Secret .')).code).toBe(1)
  })

  it('falls back to a literal match on invalid regex', async () => {
    const term = makeShell(commands)
    await term.exec('echo "a(b" | grep "a("')
    expect(term.text()).toBe('a(b')
  })

  it('rejects directories without -r and counts matches with -c', async () => {
    const term = makeShell(commands)
    expect((await term.exec('grep widgets experience')).code).toBe(1)
    expect(term.text()).toBe('grep: experience: Is a directory')
    const c = makeShell(commands)
    expect((await c.exec('grep -c widgets experience/acme/README.md')).code).toBe(0)
    expect(c.text()).toBe('1')
  })

  it('prefixes line numbers with -n and shows usage without stdin', async () => {
    const term = makeShell(commands)
    await term.exec('grep -n widgets experience/acme/README.md')
    expect(term.text()).toMatch(/^\d+:Acme builds widgets\.$/)
    const bare = makeShell(commands)
    expect((await bare.exec('grep widgets')).code).toBe(2)
    expect(bare.text()).toMatch(/^usage: grep/)
  })
})

describe('head / tail', () => {
  it('default to 10 lines from stdin', async () => {
    const term = makeShell(commands)
    await term.exec('cat skills.json | head')
    expect(term.lines).toHaveLength(10)
  })

  it('honour -n on files', async () => {
    const term = makeShell(commands)
    await term.exec('head -n 1 about.md')
    await term.exec('tail -n 1 about.md')
    expect(term.text()).toBe('About paragraph one.\nAbout paragraph two.')
  })

  it('report missing files', async () => {
    const term = makeShell(commands)
    expect((await term.exec('head nope')).code).toBe(1)
    expect(term.text()).toBe('head: nope: No such file or directory')
  })

  it('tail -n 2 returns the last two lines of stdin', async () => {
    const term = makeShell(commands)
    await term.exec('echo "a\nb\nc" | tail -n 2')
    expect(term.text()).toBe('b\nc')
  })

  it('shows usage without input', async () => {
    const term = makeShell(commands)
    expect((await term.exec('tail')).code).toBe(1)
    expect(term.text()).toMatch(/^usage: tail/)
  })

  it('prints nothing for -n 0', async () => {
    const term = makeShell(commands)
    expect((await term.exec('echo hi | tail -n 0')).code).toBe(0)
    expect(term.lines).toEqual([])
  })
})

describe('echo', () => {
  it('joins arguments', async () => {
    const term = makeShell(commands)
    await term.exec('echo a  "b c"')
    expect(term.text()).toBe('a b c')
  })

  it('prints an empty line without args', async () => {
    const term = makeShell(commands)
    await term.exec('echo')
    expect(term.lines).toHaveLength(1)
    expect(term.lines[0]!.spans).toEqual([])
  })
})
