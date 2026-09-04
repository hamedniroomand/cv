import { describe, expect, it } from 'vitest'
import { makeApp } from '../../fixtures/app'

describe('action slash commands', () => {
  it('/help lists only the canonical English v1 commands', async () => {
    const app = makeApp()

    expect(await app.run('/help')).toBe(0)
    const listed = app.text().split('\n').map(line => line.match(/^\/\S+/)?.[0]).filter(
      (name): name is string => name !== undefined,
    )
    expect(listed).toEqual([
      '/about',
      '/api',
      '/clear',
      '/contact',
      '/education',
      '/exit',
      '/experience',
      '/help',
      '/pdf',
      '/projects',
      '/skills',
      '/theme',
    ])
    expect(app.command('lang')).toBeUndefined()
  })

  it('/help explains shell fallthrough and Esc', async () => {
    const app = makeApp()

    expect(await app.run('/help')).toBe(0)
    expect(app.text()).toContain('Plain text runs as a shell command')
    expect(app.text()).toContain('Esc')
  })

  it('/contact delegates to the real shell command and opens its modal', async () => {
    const app = makeApp()

    expect(await app.run('/contact')).toBe(0)
    expect(app.calls.shell).toEqual(['contact'])
    expect(app.calls.modals).toEqual(['contact'])
    expect(app.text()).toContain('Email:')
  })

  it.each(['/pdf', '/export'])('%s delegates the PDF download to cv --pdf', async (line) => {
    const app = makeApp()

    expect(await app.run(line)).toBe(0)
    expect(app.calls.shell).toEqual(['cv --pdf'])
    expect(app.calls.downloads).toEqual(['/hamed-niroomand-cv.pdf'])
  })

  it('/theme preselects the current theme and delegates the picked theme', async () => {
    const app = makeApp({ picks: ['dracula'] })

    expect(await app.run('/theme')).toBe(0)
    expect(app.calls.pick.at(-1)?.opts?.initial).toBe('dark')
    expect(app.calls.pick.at(-1)?.items.map(item => item.value)).toEqual([
      'dark',
      'light',
      'gruvbox',
      'dracula',
      'crt',
    ])
    expect(app.calls.shell).toEqual(['theme dracula'])
    expect(app.calls.themes).toEqual(['dracula'])
  })

  it('/theme exposes argument completion and accepts a direct theme', async () => {
    const app = makeApp()

    expect(app.complete('theme').map(item => item.value)).toEqual([
      'dark',
      'light',
      'gruvbox',
      'dracula',
      'crt',
    ])
    expect(await app.run('/theme light')).toBe(0)
    expect(app.calls.shell).toEqual(['theme light'])
    expect(app.calls.pick).toHaveLength(0)
  })

  it('/theme cancellation returns 130 without applying a theme', async () => {
    const app = makeApp({ picks: [null] })

    expect(await app.run('/theme')).toBe(130)
    expect(app.text()).toBe('')
    expect(app.calls.shell).toHaveLength(0)
    expect(app.calls.themes).toHaveLength(0)
  })

  it('/api without an argument prints the supported endpoint pipelines', async () => {
    const app = makeApp()

    expect(await app.run('/api')).toBe(0)
    expect(app.text()).toContain('curl -s /api/cv | jq .')
    expect(app.text()).toContain('curl -s /api/experience | jq .')
    expect(app.text()).toContain('curl -s /api/skills | jq .')
    expect(app.text()).toContain('curl -s /api/projects | jq .')
    expect(app.calls.shell).toHaveLength(0)
  })

  it('/api cv delegates the exact real curl and jq pipeline', async () => {
    const app = makeApp()

    expect(await app.run('/api cv')).toBe(0)
    expect(app.calls.shell).toEqual(['curl -s /api/cv | jq .'])
    expect(app.calls.requests.at(-1)?.url).toBe('https://hamed.test/api/cv')
    expect(app.text()).toContain('"name": "Hamed Niroomand"')
  })

  it('/api rejects unsupported endpoint shortcuts without running shell code', async () => {
    const app = makeApp()

    expect(await app.run('/api unknown')).toBe(1)
    expect(app.text()).toContain('cv, experience, skills, projects')
    expect(app.calls.shell).toHaveLength(0)
  })

  it('/clear invokes the app View clear instead of the terminal clear command', async () => {
    const app = makeApp()
    await app.run('/about')

    expect(await app.run('/clear')).toBe(0)
    expect(app.calls.cleared).toBe(1)
    expect(app.calls.shell).not.toContain('clear')
    expect(app.text()).toBe('')
  })

  it.each(['/exit', '/quit', '/q'])('%s closes the app view', async (line) => {
    const app = makeApp()

    expect(await app.run(line)).toBe(0)
    expect(app.calls.exits).toBe(1)
  })
})
