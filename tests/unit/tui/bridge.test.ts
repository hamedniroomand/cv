import type { OutputLine } from '~/terminal/types'
import { describe, expect, it } from 'vitest'
import { commands as shellCommands } from '~/terminal/commands'
import { createAppBridge } from '~/tui/bridge'
import { commands as appCommands } from '~/tui/commands'
import { createAppRegistry } from '~/tui/registry'
import { makeShell } from '../fixtures/context'

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
})
