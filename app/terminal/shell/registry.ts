import type { Command, CommandRegistry } from '../types'

export function createRegistry(commands: Command[]): CommandRegistry {
  const byName = new Map<string, Command>()
  for (const command of commands) {
    for (const key of [command.name, ...(command.aliases ?? [])]) {
      if (byName.has(key))
        throw new Error(`duplicate command name or alias: ${key}`)
      byName.set(key, command)
    }
  }
  const sorted = [...commands].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  return {
    list: () => sorted,
    get: name => byName.get(name),
  }
}
