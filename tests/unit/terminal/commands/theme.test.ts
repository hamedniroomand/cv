import { describe, expect, it } from 'vitest'
import { makeShell } from '~~/tests/unit/fixtures/context'
import { commands } from '~/terminal/commands'

describe('theme', () => {
  it('sets a known theme', async () => {
    const term = makeShell(commands)

    expect((await term.exec('theme dracula')).code).toBe(0)
    expect(term.calls.themes).toEqual(['dracula'])
    expect(term.text()).toBe('theme: dracula')
  })

  it('rejects an unknown theme', async () => {
    const term = makeShell(commands)

    expect((await term.exec('theme zzz')).code).toBe(1)
    expect(term.calls.themes).toEqual([])
    expect(term.text()).toBe(`theme: unknown theme 'zzz' (dark, light, gruvbox, dracula, crt)`)
  })

  it('lists every theme and marks the current one', async () => {
    const term = makeShell(commands, {
      env: {
        user: 'hamed',
        host: 'hamed.sh',
        lang: 'en',
        theme: 'gruvbox',
        siteUrl: 'https://hamed.test',
      },
    })

    expect((await term.exec('theme')).code).toBe(0)
    expect(term.text()).toBe('  dark\n  light\n* gruvbox\n  dracula\n  crt')
  })

  it('completes every theme name', () => {
    const theme = commands.find(command => command.name === 'theme')

    expect(theme?.complete?.([], {} as never)).toEqual(['dark', 'light', 'gruvbox', 'dracula', 'crt'])
  })
})
