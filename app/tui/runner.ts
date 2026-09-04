import type { AppContext, AppRegistry } from './types'
import { parseSlashInput } from './slash'

export type AppRunnerContext = Omit<AppContext, 'argv0' | 'shell' | 'signal' | 'slash' | 'sudo'>

export interface AppRunnerDeps {
  registry: AppRegistry
  context: AppRunnerContext
  shell: (line: string, signal: AbortSignal) => Promise<number>
}

/** Dispatch submitted lines to exact slash commands or the existing shell. */
export function createAppRunner({ registry, context, shell }: AppRunnerDeps) {
  const run = async (line: string, signal: AbortSignal): Promise<number> => {
    const parsed = parseSlashInput(line)
    if (parsed === null)
      return shell(line, signal)

    const command = registry.get(parsed.name)
    if (!command) {
      context.view.print(`${context.env.user}: unknown command /${parsed.name} — type / to see the list`, 'error')
      return 127
    }

    const ctx: AppContext = {
      ...context,
      argv0: `/${parsed.name}`,
      sudo: false,
      signal,
      shell: nestedLine => shell(nestedLine, signal),
      slash: nestedLine => run(nestedLine, signal),
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
