import type { CommandContext, LineStyle, Span } from '~/terminal/types'

export interface PickerItem<T = string> {
  value: T
  label: string
  description?: string
  keywords?: string[]
}

export interface PickOptions<T> {
  initial?: T
  placeholder?: string
}

export interface View {
  print: (spans: Span[] | string, style?: LineStyle) => void
  clear: () => void
  pick: <T>(title: string, items: PickerItem<T>[], opts?: PickOptions<T>) => Promise<T | null>
  status: (text: string) => void
  exit: () => void
}

export interface AppContext extends Omit<CommandContext, 'stdin' | 'stdout' | 'stderr' | 'registry' | 'tty'> {
  registry: AppRegistry
  view: View
  shell: (line: string) => Promise<number>
  slash: (line: string) => Promise<number>
}

export interface AppCommand {
  name: string
  aliases?: string[]
  description: string
  args?: string
  complete?: (argv: string[], ctx: AppContext) => PickerItem[]
  run: (argv: string[], ctx: AppContext) => number | Promise<number>
}

export interface AppRegistry {
  list: () => AppCommand[]
  get: (name: string) => AppCommand | undefined
}

export const EXIT_CANCELLED = 130
