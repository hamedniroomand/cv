import type { PanelTarget } from '#shared/cv/panel-target'
import type { Lang, ModalKind, OutputLine, ShellEnv, TerminalUi, ThemeName } from '~/terminal/types'
import { buildTree, HOME } from '#shared/cv/build-tree'
import { commands } from '~/terminal/commands'
import { Vfs } from '~/terminal/fs/vfs'
import { completeLine } from '~/terminal/shell/completion'
import { Shell } from '~/terminal/shell/executor'
import { History } from '~/terminal/shell/history'
import { createRegistry } from '~/terminal/shell/registry'
import { createAppBridge } from '~/tui/bridge'
import { commands as appCommands } from '~/tui/commands'
import { createAppRegistry } from '~/tui/registry'

export interface ShellHooks {
  navigate: (target: PanelTarget) => void
  togglePanel: () => void
  setTheme: (name: ThemeName) => void
  setLang: (lang: Lang) => void
  openApp?: () => Promise<void>
  openModal: (kind: ModalKind, props?: Record<string, unknown>) => Promise<void>
  destroy: () => void
}

function hostFrom(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname
  }
  catch {
    return 'hamed.sh'
  }
}

/** Wires the pure terminal core to reactive state for the Terminal component. Client only. */
export function useShell(hooks: ShellHooks) {
  const cv = useCv()
  const siteUrl = useRuntimeConfig().public.siteUrl
  const { theme } = useTheme()

  const lines = ref<OutputLine[]>([])
  let nextId = 0
  const history = new History()
  const fs = new Vfs(buildTree(cv), { home: HOME })
  const registry = createRegistry(commands)
  const appRegistry = createAppRegistry(appCommands)
  const env: ShellEnv = { user: 'hamed', host: hostFrom(siteUrl), lang: 'en', theme: theme.value, siteUrl }

  const ui: TerminalUi = {
    clear: () => {
      lines.value = []
    },
    openApp: hooks.openApp ?? (async () => {}),
    openModal: hooks.openModal,
    openUrl: (url) => {
      window.open(url, '_blank', 'noopener')
    },
    download: (url, filename) => {
      const a = document.createElement('a')
      a.href = url
      a.download = filename ?? ''
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
    },
    destroy: hooks.destroy,
  }

  const shellDeps = {
    fs,
    registry,
    cv,
    env,
    sink: (line: OutputLine) => {
      lines.value.push(line)
    },
    nextId: () => ++nextId,
    panel: { navigate: hooks.navigate, toggle: hooks.togglePanel },
    theme: { set: hooks.setTheme },
    lang: { set: hooks.setLang },
    ui,
    net: { fetch: globalThis.fetch.bind(globalThis) },
    history: history.list(),
  }
  const shell = new Shell(shellDeps)
  const bridge = createAppBridge(shell, shellDeps, appRegistry)

  const cwdLabel = ref(fs.display(fs.cwd))
  const busy = ref(false)
  let controller: AbortController | null = null

  const prompt = () => `${env.user}@${env.host}:${cwdLabel.value}$ `

  function print(text: string, style?: OutputLine['spans'][number]['style']): void {
    lines.value.push({ id: ++nextId, spans: text ? [{ text, style }] : [] })
  }

  async function run(line: string, opts: { echo?: boolean, record?: boolean } = {}): Promise<void> {
    env.theme = theme.value
    if (opts.echo !== false)
      lines.value.push({ id: ++nextId, spans: [{ text: prompt(), style: 'prompt' }, { text: line }] })
    if (opts.record !== false)
      history.push(line)
    busy.value = true
    controller = new AbortController()
    try {
      await shell.exec(line, controller.signal)
    }
    finally {
      busy.value = false
      controller = null
      cwdLabel.value = fs.display(fs.cwd)
    }
  }

  function abort(): void {
    controller?.abort()
  }

  function complete(line: string) {
    return completeLine(line, { fs, registry, cv })
  }

  return { lines, run, abort, clear: ui.clear, complete, history, cwdLabel, busy, prompt, print, bridge }
}
