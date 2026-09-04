import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { completeLine } from '~/terminal/shell/completion'
import { makeShell } from '../../fixtures/context'

describe('whoami', () => {
  it('prints identity, links and the hint, then navigates top', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('whoami')).code).toBe(0)
    const out = s.text()
    expect(out).toContain('Hamed Niroomand')
    expect(out).toContain('Frontend Team Lead / Senior TypeScript Engineer')
    expect(out).toContain('Yerevan, Armenia (UTC+4) · Remote')
    expect(out).toContain('Type \'help\', run \'hamed\' for the guided mode — or just read the panel →')
    const hrefs = s.lines.flatMap(l => l.spans).map(sp => sp.href).filter(Boolean)
    expect(hrefs).toContain('https://github.com/hamedniroomand')
    expect(hrefs).toContain('mailto:me@example.com')
    expect(s.calls.navigate).toEqual([{ section: 'top' }])
  })
})

describe('open', () => {
  it('opens known targets', async () => {
    const s = makeShell(commands)
    await s.shell.exec('open github')
    await s.shell.exec('open email')
    await s.shell.exec('open cue')
    await s.shell.exec('open https://example.test/x')
    expect(s.calls.opened).toEqual([
      'https://github.com/hamedniroomand',
      'mailto:me@example.com',
      'https://github.com/hamedniroomand/cue',
      'https://example.test/x',
    ])
  })
  it('pdf downloads', async () => {
    const s = makeShell(commands)
    await s.shell.exec('open pdf')
    expect(s.calls.downloads).toEqual(['/hamed-niroomand-cv.pdf'])
  })
  it('lists targets on unknown input', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('open zzz')).code).toBe(1)
    expect(s.text()).toMatch(/github, linkedin, email, cue, pdf/)
    expect((await s.shell.exec('open')).code).toBe(1)
  })
  it('completes targets', () => {
    const s = makeShell(commands)
    expect(completeLine('open gi', { fs: s.deps.fs, registry: s.deps.registry, cv: s.deps.cv })).toEqual({ line: 'open github ', candidates: ['github'] })
  })
})

describe('cv', () => {
  it('prints a summary and navigates top', async () => {
    const s = makeShell(commands)
    await s.shell.exec('cv')
    expect(s.text()).toContain('Hamed Niroomand')
    expect(s.text()).toContain('Team Lead @ Acme')
    expect(s.calls.navigate).toEqual([{ section: 'top' }])
  })
  it('--pdf downloads the resume', async () => {
    const s = makeShell(commands)
    await s.shell.exec('cv --pdf')
    expect(s.calls.downloads).toEqual(['/hamed-niroomand-cv.pdf'])
    expect(s.text()).toBe('Downloading hamed-niroomand-cv.pdf…')
  })
  it('--json dumps the data', async () => {
    const s = makeShell(commands)
    await s.shell.exec('cv --json | head -n 1')
    expect(s.text()).toBe('{')
    const s2 = makeShell(commands)
    await s2.shell.exec('cv --json | grep -c secrets')
    expect(s2.text()).toBe('0')
  })
})

describe('contact', () => {
  it('prints links, navigates and opens the modal', async () => {
    const s = makeShell(commands)
    await s.shell.exec('contact')
    expect(s.text()).toContain('me@example.com')
    expect(s.calls.navigate).toEqual([{ section: 'contact' }])
    expect(s.calls.modals).toEqual(['contact'])
  })
})

describe('skills', () => {
  it('prints every category', async () => {
    const s = makeShell(commands)
    await s.shell.exec('skills')
    expect(s.text()).toBe('Frontend\n  Vue 3, Nuxt 4\nBackend\n  Bun, NestJS (APIs)')
    expect(s.calls.navigate).toEqual([{ section: 'skills' }])
  })
  it('filters by --category', async () => {
    const s = makeShell(commands)
    await s.shell.exec('skills --category backend')
    expect(s.text()).toBe('Backend\n  Bun, NestJS (APIs)')
  })
  it('rejects unknown categories', async () => {
    const s = makeShell(commands)
    expect((await s.shell.exec('skills --category zzz')).code).toBe(1)
    expect(s.text()).toBe('skills: unknown category \'zzz\' (try: frontend, backend)')
  })
  it('completes category ids', () => {
    const s = makeShell(commands)
    const ctx = { fs: s.deps.fs, registry: s.deps.registry, cv: s.deps.cv }
    expect(completeLine('skills --category f', ctx).line).toBe('skills --category frontend ')
    expect(completeLine('skills -', ctx).candidates).toEqual(['--category'])
  })
})
