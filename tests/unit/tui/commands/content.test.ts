import type { AppCommand } from '~/tui/types'
import { describe, expect, it } from 'vitest'
import { makeApp } from '../../fixtures/app'

describe('content slash commands', () => {
  it('records View clear, status, and exit effects from a command run through the app', async () => {
    const effects: AppCommand = {
      name: 'view-effects',
      description: 'Exercise observable View effects',
      run: (_argv, ctx) => {
        ctx.view.print('discarded')
        ctx.view.clear()
        ctx.view.status('Ready')
        ctx.view.exit()
        return 0
      },
    }
    const app = makeApp({ commands: [effects] })

    expect(await app.run('/view-effects')).toBe(0)
    expect(app.text()).toBe('')
    expect(app.calls.cleared).toBe(1)
    expect(app.calls.statuses).toEqual(['Ready'])
    expect(app.calls.exits).toBe(1)
  })

  it('/experience picks a company, prints its generated README and highlight bullets', async () => {
    const app = makeApp({ picks: ['acme'] })

    expect(await app.run('/experience')).toBe(0)
    expect(app.lines[0]!.spans).toEqual([{ text: 'Acme', style: 'accent' }])
    expect(app.text()).toContain('Team Lead · Sep 2022 – Aug 2026')
    expect(app.text()).toContain('  • Shipped the thing — Shipped the thing to production.')
    expect(app.calls.navigate).toContainEqual({ section: 'experience', slug: 'acme' })
    expect(app.calls.pick[0]?.items).toContainEqual(expect.objectContaining({
      value: 'acme',
      label: 'Acme',
      description: 'Team Lead · Sep 2022 – Aug 2026; Senior Developer · Jan 2022 – Sep 2022',
      keywords: expect.arrayContaining(['acme', 'Vue 3', 'Nuxt 4']),
    }))
  })

  it.each([
    ['/experience acme', 'Acme\nTeam Lead'],
    ['/experience GLOB', 'Globex\nWeb Developer'],
  ])('%s resolves a slug or unique case-insensitive company prefix', async (line, heading) => {
    const app = makeApp()

    expect(await app.run(line)).toBe(0)
    expect(app.text()).toContain(heading)
    expect(app.calls.pick).toHaveLength(0)
  })

  it('/experience reports unknown values with valid slugs', async () => {
    const app = makeApp()

    expect(await app.run('/experience unknown')).toBe(1)
    expect(app.text()).toContain('acme, globex')
    expect(app.calls.navigate).toHaveLength(0)
  })

  it('/experience exposes company picker completions', () => {
    const app = makeApp()

    expect(app.complete('experience').map(item => item.value)).toEqual(['acme', 'globex'])
  })

  it('/projects prints its README and links, then navigates to the selected project', async () => {
    const app = makeApp({ picks: ['cue'] })

    expect(await app.run('/projects')).toBe(0)
    expect(app.lines[0]!.spans).toEqual([{ text: 'Cue', style: 'accent' }])
    expect(app.text()).toContain('https://github.com/hamedniroomand/cue')
    expect(app.text()).toContain('https://hamedniroomand.github.io/cue')
    expect(app.calls.navigate).toContainEqual({ section: 'projects', slug: 'cue' })
  })

  it('/projects accepts a direct slug and reports unknown values with valid slugs', async () => {
    const selected = makeApp()
    const unknown = makeApp()

    expect(await selected.run('/projects CUE')).toBe(0)
    expect(selected.calls.pick).toHaveLength(0)
    expect(selected.text()).toContain('Cue')
    expect(selected.text()).not.toContain('# Cue')
    expect(await unknown.run('/projects unknown')).toBe(1)
    expect(unknown.text()).toContain('cue')
  })

  it('/projects exposes project picker completions', () => {
    const app = makeApp()

    expect(app.complete('projects')).toContainEqual(expect.objectContaining({
      value: 'cue',
      label: 'Cue',
      description: 'Drive coding agents from GitHub labels.',
      keywords: expect.arrayContaining(['cue', 'TypeScript', 'Bun']),
    }))
  })

  it('/skills delegates category rendering to the existing shell command', async () => {
    const app = makeApp({ picks: ['frontend'] })

    expect(await app.run('/skills')).toBe(0)
    expect(app.calls.shell).toContain('skills --category frontend')
    expect(app.text()).toContain('Vue 3, Nuxt 4')
    expect(app.calls.navigate).toContainEqual({ section: 'skills' })
  })

  it('/skills delegates the all option without a category filter', async () => {
    const app = makeApp({ picks: ['all'] })

    expect(await app.run('/skills')).toBe(0)
    expect(app.calls.shell).toEqual(['skills'])
    expect(app.text()).toContain('Frontend')
    expect(app.text()).toContain('Backend')
  })

  it('/skills exposes all and category picker completions', () => {
    const app = makeApp()

    expect(app.complete('skills')).toEqual([
      expect.objectContaining({ value: 'all', label: 'All skills' }),
      expect.objectContaining({ value: 'frontend', label: 'Frontend' }),
      expect.objectContaining({ value: 'backend', label: 'Backend' }),
    ])
  })

  it.each(['/experience', '/projects', '/skills'])('%s cancellation prints nothing and returns 130', async (line) => {
    const app = makeApp({ picks: [null] })

    expect(await app.run(line)).toBe(130)
    expect(app.text()).toBe('')
    expect(app.calls.navigate).toHaveLength(0)
    expect(app.calls.shell).toHaveLength(0)
  })

  it('/about prints the VFS document and navigates to about', async () => {
    const app = makeApp()

    expect(await app.run('/about')).toBe(0)
    expect(app.text()).toBe('About paragraph one.\n\nAbout paragraph two.')
    expect(app.calls.navigate).toEqual([{ section: 'about' }])
  })

  it('/education prints the generated VFS document and navigates to education', async () => {
    const app = makeApp()

    expect(await app.run('/education')).toBe(0)
    expect(app.lines[0]!.spans).toEqual([{ text: 'B.Sc. Mechanical Engineering', style: 'accent' }])
    expect(app.text()).toContain('Sep 2018 – Jun 2022')
    expect(app.text()).toContain('Studied while working.')
    expect(app.calls.navigate).toEqual([{ section: 'education' }])
  })
})
