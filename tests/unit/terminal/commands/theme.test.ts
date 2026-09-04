import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'

describe('theme', () => {
  it('sets a known theme', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('theme dracula')).code).toBe(0)
    expect(s.calls.themes).toEqual(['dracula'])
    expect(s.text()).toBe('theme: dracula')
  })

  it('rejects an unknown theme', async () => {
    const s = makeShell(commands)

    expect((await s.shell.exec('theme zzz')).code).toBe(1)
    expect(s.calls.themes).toEqual([])
    expect(s.text()).toBe(`theme: unknown theme 'zzz' (dark, light, gruvbox, dracula, crt)`)
  })

  it('lists every theme and marks the current one', async () => {
    const s = makeShell(commands, {
      env: {
        user: 'hamed',
        host: 'hamed.sh',
        lang: 'en',
        theme: 'gruvbox',
        siteUrl: 'https://hamed.test',
      },
    })

    expect((await s.shell.exec('theme')).code).toBe(0)
    expect(s.text()).toBe('  dark\n  light\n* gruvbox\n  dracula\n  crt')
  })

  it('completes every theme name', () => {
    const theme = commands.find(command => command.name === 'theme')

    expect(theme?.complete?.([], {} as never)).toEqual(['dark', 'light', 'gruvbox', 'dracula', 'crt'])
  })
})
