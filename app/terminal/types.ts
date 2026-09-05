import type { PanelTarget } from '#shared/cv/panel-target';
import type { CvData } from '#shared/schemas/cv';
import type { ThemeName } from '#shared/theme';

import type { VirtualFS } from './fs/types';

export type { ThemeName } from '#shared/theme';
export type Lang = 'en' | 'fa';

export type LineStyle = 'plain' | 'dim' | 'accent' | 'error' | 'success' | 'prompt' | 'pre';

export interface Span {
  text: string;
  style?: LineStyle;
  href?: string;
}

export interface OutputLine {
  id: number;
  spans: Span[];
}

export interface Writer {
  write: (text: string, style?: LineStyle) => void;
  line: (text?: string, style?: LineStyle) => void;
  link: (label: string, href: string) => void;
  raw: (spans: Span[]) => void;
  flush: () => void;
}

export type ModalKind = 'contact' | 'editor';

export interface TerminalUi {
  clear: () => void;
  openApp: () => Promise<void>;
  openModal: (kind: ModalKind, props?: Record<string, unknown>) => Promise<void>;
  openUrl: (url: string) => void;
  download: (url: string, filename?: string) => void;
  destroy: () => void;
}

export interface ShellEnv {
  user: string;
  host: string;
  lang: Lang;
  theme: ThemeName;
  siteUrl: string;
}

export interface CommandRegistry {
  list: () => Command[];
  get: (name: string) => Command | undefined;
}

export interface CompletionContext {
  fs: VirtualFS;
  registry: CommandRegistry;
  cv: CvData;
}

export interface PanelControls {
  navigate: (target: PanelTarget) => void;
  toggle: () => void;
}

export interface CommandContext {
  fs: VirtualFS;
  stdin: string | null;
  stdout: Writer;
  stderr: Writer;
  argv0: string;
  sudo: boolean;
  tty: boolean;
  env: Readonly<ShellEnv>;
  cv: CvData;
  panel: PanelControls;
  theme: { set: (name: ThemeName) => void };
  lang: { set: (lang: Lang) => void };
  history: readonly string[];
  registry: CommandRegistry;
  ui: TerminalUi;
  signal: AbortSignal;
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  hidden?: boolean;
  complete?: (argv: string[], ctx: CompletionContext) => string[];
  run: (argv: string[], ctx: CommandContext) => number | Promise<number>;
}
