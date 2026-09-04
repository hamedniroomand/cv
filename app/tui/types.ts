import type { CommandContext, LineStyle, Span } from '~/terminal/types'

export interface PickerItem<T = string> {
  value: T
  label: string
  description?: string
  /** Extra text matched by the filter but not shown (e.g. slugs, stack). */
  keywords?: string[]
}

export interface View {
  /** Append rendered lines to the content area. Same Span model as the terminal. */
  print: (spans: Span[] | string, style?: LineStyle) => void
  clear: () => void
  /** Show a single-select list. Resolves with the chosen value or null on Esc. */
  pick: <T>(title: string, items: PickerItem<T>[], opts?: { initial?: T, placeholder?: string }) => Promise<T | null>
  /** Set the header's second line (status/hint). */
  status: (text: string) => void
  /** Leave the app. */
  exit: () => void
}

export interface AppContext extends Omit<CommandContext, 'stdin' | 'stdout' | 'stderr'> {
  view: View
  /** Run a plain shell line inside the app; output goes to the content area. Resolves exit code. */
  shell: (line: string) => Promise<number>
  /** Run another slash command programmatically (e.g. /help → /experience). */
  slash: (line: string) => Promise<number>
}

export interface AppCommand {
  name: string
  aliases?: string[]
  description: string
  /** Argument hint shown in the menu, e.g. '[company]'. Absent → takes no arguments. */
  args?: string
  /** Argument completion for the menu once a space is typed. */
  complete?: (argv: string[], ctx: AppContext) => PickerItem[]
  run: (argv: string[], ctx: AppContext) => number | Promise<number>
}

export interface AppRegistry {
  list: () => AppCommand[]
  get: (name: string) => AppCommand | undefined
}
