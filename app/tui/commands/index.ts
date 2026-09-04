import type { AppCommand } from '../types'

const modules = import.meta.glob<AppCommand>(['./*.ts', '!./index.ts'], { eager: true, import: 'default' })

export const commands: AppCommand[] = Object.values(modules)
