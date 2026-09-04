import type { AppContext, AppRegistry } from './types'
import { parseSlashInput } from './slash'

export type AppRunnerContext = Omit<AppContext, 'argv0' | 'registry' | 'shell' | 'signal' | 'slash' | 'sudo'>

export interface AppRunnerDeps {
  registry: AppRegistry
  context: AppRunnerContext
  shell: (line: string, signal: AbortSignal) => Promise<number>
}

const EXIT_NOT_FOUND = 127

export function createAppRunner({ registry, context, shell }: AppRunnerDeps) {
  const runShell = async (line: string, signal: AbortSignal): Promise<number> => {
    const previousClear = context.ui.clear
    context.ui.clear = () => context.view.clear()
    try {
      return await shell(line, signal)
    }
    finally {
      context.ui.clear = previousClear
    }
  }

  const run = async (line: string, signal: AbortSignal): Promise<number> => {
    const parsed = parseSlashInput(line)
    if (parsed === null)
      return runShell(line, signal)

    const command = registry.get(parsed.name)
    if (!command) {
      context.view.print(`${context.env.user}: unknown command /${parsed.name} — type / to see the list`, 'error')
      return EXIT_NOT_FOUND
    }

    const ctx: AppContext = {
      ...context,
      argv0: `/${parsed.name}`,
      registry,
      sudo: false,
      signal,
      shell: nested => runShell(nested, signal),
      slash: nested => run(nested, signal),
    }
    try {
      return await command.run(parsed.argv, ctx)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      context.view.print(`${context.env.user}: /${parsed.name}: ${message}`, 'error')
      return 1
    }
  }

  return { run }
}
