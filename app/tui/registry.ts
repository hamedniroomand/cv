import type { AppCommand, AppRegistry } from './types';

export function createAppRegistry(commands: AppCommand[]): AppRegistry {
  const byName = new Map<string, AppCommand>();
  for (const command of commands) {
    for (const key of [command.name, ...(command.aliases ?? [])]) {
      if (byName.has(key)) throw new Error(`duplicate app command: ${key}`);
      byName.set(key, command);
    }
  }
  const sorted = [...commands].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return {
    list: () => sorted,
    get: name => byName.get(name),
  };
}
