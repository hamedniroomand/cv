import type { Command, CommandRegistry } from '../types'

/** Index commands by name and alias. Throws on collisions so a bad command file fails fast. */
export function createRegistry(commands: Command[]): CommandRegistry {
  const byName = new Map<string, Command>()
  for (const cmd of commands) {
    for (const key of [cmd.name, ...(cmd.aliases ?? [])]) {
      if (byName.has(key))
        throw new Error(`duplicate command name or alias: ${key}`)
      byName.set(key, cmd)
    }
  }
  const sorted = [...commands].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  return {
    list: () => sorted,
    get: name => byName.get(name),
  }
}
