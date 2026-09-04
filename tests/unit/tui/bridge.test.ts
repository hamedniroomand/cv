import type { OutputLine, ThemeName } from '~/terminal/types'
import type { View } from '~/tui/types'
import { describe, expect, it } from 'vitest'
import { commands as shellCommands } from '~/terminal/commands'
import { createAppBridge } from '~/tui/bridge'
import { commands as appCommands } from '~/tui/commands'
import { createAppRegistry } from '~/tui/registry'
import { createAppRunner } from '~/tui/runner'
import { makeShell } from '../fixtures/context'

function texts(lines: OutputLine[]): string[] {
  return lines.map(line => line.spans.map(span => span.text).join(''))
}

describe('createAppBridge', () => {
  it('reuses the shell context and app registry by reference', () => {
    const shell = makeShell(shellCommands)
    const appRegistry = createAppRegistry(appCommands)

    const bridge = createAppBridge(shell.shell, shell.deps, appRegistry)

    expect(bridge.registry).toBe(appRegistry)
    expect(bridge.context.fs).toBe(shell.deps.fs)
    expect(bridge.context.env).toBe(shell.deps.env)
    expect(bridge.context.cv).toBe(shell.deps.cv)
    expect(bridge.context.panel).toBe(shell.deps.panel)
    expect(bridge.context.theme).toBe(shell.deps.theme)
    expect(bridge.context.lang).toBe(shell.deps.lang)
    expect(bridge.context.history).toBe(shell.deps.history)
    expect(bridge.context.ui).toBe(shell.deps.ui)
    expect(bridge.context.net).toBe(shell.deps.net)
  })

  it('shares VFS state while isolating output and preserving normal history', async () => {
    const shell = makeShell(shellCommands, { history: ['whoami'] })
    await shell.shell.exec('pwd')
    const previousScrollback = [...shell.lines]
    const previousHistory = [...shell.history]
    const appLines: OutputLine[] = []
    let appId = 100
    const bridge = createAppBridge(
      shell.shell,
      shell.deps,
      createAppRegistry(appCommands),
    )
    const signal = new AbortController().signal

    expect(await bridge.exec('cd experience/acme', line => appLines.push(line), () => ++appId, signal)).toBe(0)
    expect(await bridge.exec('pwd', line => appLines.push(line), () => ++appId, signal)).toBe(0)
    expect(await bridge.exec('missing-command', line => appLines.push(line), () => ++appId, signal)).toBe(127)

    expect(appLines.map(line => line.spans.map(span => span.text).join(''))).toEqual([
      '/home/hamed/experience/acme',
      'bash: missing-command: command not found',
    ])
    expect(appLines.map(line => line.id)).toEqual([101, 102])
    expect(shell.lines).toEqual(previousScrollback)
    expect(shell.history).toEqual(previousHistory)
    expect(shell.deps.fs.cwd).toBe('/home/hamed/experience/acme')
  })

  it.each(['clear', 'cls'])('%s in app mode clears app output without wiping parked shell lines', async (command) => {
    const shell = makeShell(shellCommands)
    shell.deps.ui.clear = () => {
      shell.lines.splice(0)
    }
    await shell.shell.exec('whoami')
    const parked = [...shell.lines]
    expect(parked.length).toBeGreaterThan(0)

    const appLines: OutputLine[] = []
    let appId = 200
    const view: View = {
      print: () => {},
      clear: () => {
        appLines.splice(0)
      },
      pick: async () => null,
      status: () => {},
      exit: () => {},
    }
    const bridge = createAppBridge(shell.shell, shell.deps, createAppRegistry(appCommands))
    const runner = createAppRunner({
      registry: bridge.registry,
      context: { ...bridge.context, view },
      shell: (line, signal) => bridge.exec(line, out => appLines.push(out), () => ++appId, signal),
    })
    const signal = new AbortController().signal

    expect(await runner.run('echo visible', signal)).toBe(0)
    expect(texts(appLines)).toEqual(['visible'])
    expect(shell.lines).toEqual(parked)

    expect(await runner.run(command, signal)).toBe(0)
    expect(appLines).toEqual([])
    expect(shell.lines).toEqual(parked)
  })

  it('keeps env.theme aligned with a live theme across app executions', async () => {
    let live: ThemeName = 'dark'
    const shell = makeShell(shellCommands)
    shell.deps.env.theme = live
    const apply = shell.deps.theme.set
    shell.deps.theme.set = (name) => {
      live = name
      apply(name)
    }

    const appLines: OutputLine[] = []
    let appId = 300
    const bridge = createAppBridge(
      shell.shell,
      shell.deps,
      createAppRegistry(appCommands),
      () => live,
    )
    const signal = new AbortController().signal
    const exec = (line: string) =>
      bridge.exec(line, out => appLines.push(out), () => ++appId, signal)

    expect(await exec('theme dracula')).toBe(0)
    expect(live).toBe('dracula')
    expect(shell.deps.env.theme).toBe('dracula')

    expect(await exec('theme')).toBe(0)
    expect(texts(appLines).join('\n')).toMatch(/^\* dracula$/m)
    expect(texts(appLines).join('\n')).not.toMatch(/^\* dark$/m)
  })
})
