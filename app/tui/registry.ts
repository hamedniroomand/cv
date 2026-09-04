import type { AppCommand, AppRegistry } from './types'

/** Index slash commands by name and alias. Throws on collisions so a bad command file fails fast. */
export function createAppRegistry(commands: AppCommand[]): AppRegistry {
  const byName = new Map<string, AppCommand>()
  for (const cmd of commands) {
    for (const key of [cmd.name, ...(cmd.aliases ?? [])]) {
      if (byName.has(key))
        throw new Error(`duplicate app command: ${key}`)
      byName.set(key, cmd)
    }
  }
  const sorted = [...commands].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  return {
    list: () => sorted,
    get: name => byName.get(name),
  }
}
