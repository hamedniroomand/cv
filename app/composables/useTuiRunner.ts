import type { LineSink } from '~/terminal/io/writer'
import type { AppBridge } from '~/tui/bridge'
import type { AppCommand, AppContext, View } from '~/tui/types'
import { History } from '~/terminal/shell/history'
import { createAppRunner } from '~/tui/runner'

interface TuiRunnerDeps {
  bridge: AppBridge
  view: View
  sink: LineSink
  nextId: () => number
  onSettled: () => void
}

export function useTuiRunner({ bridge, view, sink, nextId, onSettled }: TuiRunnerDeps) {
  const busy = ref(false)
  const history = new History()
  let controller: AbortController | null = null

  const runShell = (line: string, signal: AbortSignal): Promise<number> => bridge.exec(line, sink, nextId, signal)

  const runner = createAppRunner({
    registry: bridge.registry,
    context: { ...bridge.context, view },
    shell: runShell,
  })

  function completionContext(command: AppCommand): AppContext {
    const signal = controller?.signal ?? new AbortController().signal
    return {
      ...bridge.context,
      argv0: `/${command.name}`,
      registry: bridge.registry,
      sudo: false,
      signal,
      view,
      shell: line => runShell(line, signal),
      slash: line => runner.run(line, signal),
    }
  }

  async function run(line: string): Promise<void> {
    if (busy.value)
      return
    history.push(line)
    view.print([{ text: '› ', style: 'prompt' }, { text: line }])
    busy.value = true
    controller = new AbortController()
    try {
      await runner.run(line, controller.signal)
    }
    finally {
      busy.value = false
      controller = null
      onSettled()
    }
  }

  function abort(): void {
    controller?.abort()
  }

  return { busy: readonly(busy), history, run, abort, completionContext }
}
