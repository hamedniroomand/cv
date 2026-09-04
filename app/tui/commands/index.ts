import type { AppCommand } from '../types'

const modules = import.meta.glob<AppCommand>(['./*.ts', '!./index.ts'], { eager: true, import: 'default' })

/** Every app command module in this directory, discovered once by Vite in Vitest and Nuxt. */
export const commands: AppCommand[] = Object.values(modules)
