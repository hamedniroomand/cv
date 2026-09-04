import { describe, expect, it } from 'vitest'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'

describe('hamed', () => {
  it.each(['hamed', 'app', 'tui'])('%s opens app mode and reports exit', async (name) => {
    const app = makeShell(commands)

    const result = await app.shell.exec(name)

    expect(result.code).toBe(0)
    expect((app.calls as typeof app.calls & { apps: number }).apps).toBe(1)
    expect(app.text()).toBe('hamed: exited')
  })

  it('reports exit only after app mode closes', async () => {
    const app = makeShell(commands)
    let closeApp!: () => void
    const closed = new Promise<void>((resolve) => {
      closeApp = resolve
    })
    ;(app.deps.ui as typeof app.deps.ui & { openApp: () => Promise<void> }).openApp = () => closed

    const execution = app.shell.exec('hamed')
    await Promise.resolve()
    expect(app.text()).toBe('')

    closeApp()
    expect((await execution).code).toBe(0)
    expect(app.text()).toBe('hamed: exited')
  })
})
