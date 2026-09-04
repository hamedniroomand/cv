import type { Command } from '../types'

const modules = import.meta.glob<Command>(['./*.ts', '!./index.ts', '!./_*.ts'], { eager: true, import: 'default' })

export const commands: Command[] = Object.values(modules)
