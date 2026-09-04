import type { PanelTarget } from '#shared/cv/panel-target'
import type { ShellDeps } from '~/terminal/shell/executor'
import type { Command, OutputLine } from '~/terminal/types'
import { buildTree, HOME } from '#shared/cv/build-tree'
import { Vfs } from '~/terminal/fs/vfs'
import { Shell } from '~/terminal/shell/executor'
import { createRegistry } from '~/terminal/shell/registry'
import { fixtureCv } from './cv'

export interface FetchCall {
  url: string
  init?: RequestInit
}

export interface ShellCalls {
  navigate: PanelTarget[]
  toggled: number
  opened: string[]
  downloads: string[]
  modals: string[]
  /** Props passed alongside each `modals` entry, same order. */
  modalProps: (Record<string, unknown> | undefined)[]
  cleared: number
  destroyed: number
  themes: string[]
  langs: string[]
  requests: FetchCall[]
}

/** Build a Shell wired to the fixture content with every side effect recorded. */
export function makeShell(commands: Command[], overrides: Partial<ShellDeps> = {}) {
  const lines: OutputLine[] = []
  let id = 0
  const calls: ShellCalls = { navigate: [], toggled: 0, opened: [], downloads: [], modals: [], modalProps: [], cleared: 0, destroyed: 0, themes: [], langs: [], requests: [] }
  const history: string[] = []
  const deps: ShellDeps = {
    fs: new Vfs(buildTree(fixtureCv), { home: HOME }),
    registry: createRegistry(commands),
    cv: fixtureCv,
    env: { user: 'hamed', host: 'hamed.sh', lang: 'en', theme: 'dark', siteUrl: 'https://hamed.test' },
    sink: l => lines.push(l),
    nextId: () => ++id,
    panel: { navigate: t => calls.navigate.push(t), toggle: () => calls.toggled++ },
    theme: { set: t => calls.themes.push(t) },
    lang: { set: l => calls.langs.push(l) },
    ui: {
      clear: () => calls.cleared++,
      openModal: async (kind, props) => {
        calls.modals.push(kind)
        calls.modalProps.push(props)
      },
      openUrl: url => calls.opened.push(url),
      download: url => calls.downloads.push(url),
      destroy: () => calls.destroyed++,
    },
    history,
    net: {
      fetch: async (url, init) => {
        calls.requests.push({ url: String(url), init })
        return new Response(JSON.stringify(fixtureCv), { status: 200, statusText: 'OK', headers: { 'content-type': 'application/json' } })
      },
    },
    ...overrides,
  }
  const shell = new Shell(deps)
  const text = () => lines.map(l => l.spans.map(s => s.text).join('')).join('\n')
  return { shell, lines, text, calls, history, deps }
}
