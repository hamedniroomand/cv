import type { Command } from '../types'

const modules = import.meta.glob<Command>('./*.ts', { eager: true, import: 'default' })

/** Every command module in this directory. Add a file here and it is registered. */
export const commands: Command[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith('/index.ts') && !path.includes('/_'))
  .map(([, command]) => command)
