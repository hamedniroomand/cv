import type { AppRunnerContext } from './runner'
import type { AppRegistry } from './types'
import type { LineSink } from '~/terminal/io/writer'
import type { Shell, ShellDeps } from '~/terminal/shell/executor'
import type { ThemeName } from '~/terminal/types'

export type AppContextBase = Omit<AppRunnerContext, 'view'>

export interface AppBridge {
  context: AppContextBase
  registry: AppRegistry
  exec: (line: string, sink: LineSink, nextId: () => number, signal: AbortSignal) => Promise<number>
}

export function createAppBridge(
  shell: Shell,
  deps: ShellDeps,
  registry: AppRegistry,
  liveTheme: () => ThemeName = () => deps.env.theme,
): AppBridge {
  const { fs, env, cv, panel, theme, lang, history, ui } = deps
  return {
    context: { fs, env, cv, panel, theme, lang, history, ui },
    registry,
    exec: async (line, sink, nextId, signal) => {
      deps.env.theme = liveTheme()
      try {
        const result = await shell.exec(line, signal, { sink, nextId })
        return result.code
      }
      finally {
        deps.env.theme = liveTheme()
      }
    },
  }
}
