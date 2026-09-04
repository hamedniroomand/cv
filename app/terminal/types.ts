import type { PanelTarget } from '#shared/cv/panel-target'
import type { CvData } from '#shared/schemas/cv'
import type { VirtualFS } from './fs/types'

export type ThemeName = 'dark' | 'light' | 'gruvbox' | 'dracula' | 'crt'
export type Lang = 'en' | 'fa'

export type LineStyle = 'plain' | 'dim' | 'accent' | 'error' | 'success' | 'prompt' | 'pre'

export interface Span {
  text: string
  style?: LineStyle
  href?: string
}

export interface OutputLine {
  id: number
  spans: Span[]
}

/** Text sink handed to commands. Never accepts HTML. */
export interface Writer {
  write: (text: string, style?: LineStyle) => void
  line: (text?: string, style?: LineStyle) => void
  link: (label: string, href: string) => void
  /** Append pre-built spans to the current line (ASCII art, coloured matches). */
  raw: (spans: Span[]) => void
  /** Emit any pending partial line. */
  flush: () => void
}

export type ModalKind = 'contact' | 'editor'

/** Side effects on the terminal component. */
export interface TerminalUi {
  clear: () => void
  /** Resolves when the modal closes. */
  openModal: (kind: ModalKind, props?: Record<string, unknown>) => Promise<void>
  openUrl: (url: string) => void
  download: (url: string, filename?: string) => void
  /** `rm -rf /` hook. */
  destroy: () => void
}

export interface ShellEnv {
  user: string
  host: string
  lang: Lang
  theme: ThemeName
  siteUrl: string
}

export interface CommandRegistry {
  list: () => Command[]
  get: (name: string) => Command | undefined
}

export interface CompletionContext {
  fs: VirtualFS
  registry: CommandRegistry
  cv: CvData
}

export interface CommandContext {
  fs: VirtualFS
  /** Text piped from the previous command, else null. */
  stdin: string | null
  stdout: Writer
  stderr: Writer
  /** The name actually typed (alias-aware). */
  argv0: string
  sudo: boolean
  env: Readonly<ShellEnv>
  cv: CvData
  panel: {
    navigate: (target: PanelTarget) => void
    toggle: () => void
  }
  theme: { set: (name: ThemeName) => void }
  lang: { set: (lang: Lang) => void }
  history: readonly string[]
  registry: CommandRegistry
  ui: TerminalUi
  signal: AbortSignal
}

export interface Command {
  name: string
  aliases?: string[]
  /** One line, shown by `help`. */
  description: string
  /** e.g. `ls [-la] [path...]` */
  usage: string
  /** Runnable but not listed by `help`. */
  hidden?: boolean
  complete?: (argv: string[], ctx: CompletionContext) => string[]
  /** Returns the exit code. */
  run: (argv: string[], ctx: CommandContext) => number | Promise<number>
}
