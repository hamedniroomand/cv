import type { AppRunnerContext } from './runner'
import type { AppRegistry } from './types'
import type { LineSink } from '~/terminal/io/writer'
import type { Shell, ShellDeps } from '~/terminal/shell/executor'

export type AppContextBase = Omit<AppRunnerContext, 'view'>

export interface AppBridge {
  context: AppContextBase
  registry: AppRegistry
  exec: (
    line: string,
    sink: LineSink,
    nextId: () => number,
    signal: AbortSignal,
  ) => Promise<number>
}

/** Reuses the live shell and its dependencies while redirecting one execution's output. */
export function createAppBridge(shell: Shell, deps: ShellDeps, registry: AppRegistry): AppBridge {
  const context: AppContextBase = {
    fs: deps.fs,
    env: deps.env,
    cv: deps.cv,
    panel: deps.panel,
    theme: deps.theme,
    lang: deps.lang,
    history: deps.history,
    ui: deps.ui,
    net: deps.net,
  }

  return {
    context,
    registry,
    exec: async (line, sink, nextId, signal) => {
      const result = await shell.exec(line, signal, { sink, nextId })
      return result.code
    },
  }
}
