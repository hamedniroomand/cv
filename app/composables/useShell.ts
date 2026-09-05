import { buildTree, HOME } from '#shared/cv/build-tree';
import type { PanelTarget } from '#shared/cv/panel-target';
import { siteHost } from '#shared/site-host';
import { commands } from '~/terminal/commands';
import { Vfs } from '~/terminal/fs/vfs';
import { completeLine } from '~/terminal/shell/completion';
import type { ShellDeps } from '~/terminal/shell/executor';
import { Shell } from '~/terminal/shell/executor';
import { History } from '~/terminal/shell/history';
import { createRegistry } from '~/terminal/shell/registry';
import type {
  Lang,
  LineStyle,
  ModalKind,
  OutputLine,
  ShellEnv,
  TerminalUi,
  ThemeName,
} from '~/terminal/types';
import { createAppBridge } from '~/tui/bridge';
import { commands as appCommands } from '~/tui/commands';
import { createAppRegistry } from '~/tui/registry';

export interface ShellHooks {
  navigate: (target: PanelTarget) => void;
  togglePanel: () => void;
  revealPanel: () => void;
  setTheme: (name: ThemeName) => void;
  setLang: (lang: Lang) => void;
  openApp: () => Promise<void>;
  openModal: (kind: ModalKind, props?: Record<string, unknown>) => Promise<void>;
  destroy: () => void;
}

export interface RunOptions {
  echo?: boolean;
  record?: boolean;
}

function createTerminalUi(hooks: ShellHooks, clear: () => void): TerminalUi {
  return {
    clear,
    openApp: hooks.openApp,
    openModal: hooks.openModal,
    openUrl: openInNewTab,
    download: downloadFile,
    destroy: hooks.destroy,
  };
}

export function useShell(hooks: ShellHooks) {
  const cv = useCv();
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const { theme } = useTheme();

  const lines = ref<OutputLine[]>([]);
  const busy = ref(false);
  let nextId = 0;
  let controller: AbortController | null = null;

  const { terminal } = useAppConfig();
  const history = new History(
    terminal.sessionHistorySize,
    createHistoryStore(terminal.historySize),
  );
  const fs = new Vfs(buildTree(cv), { home: HOME });
  const initialCwd = useTerminalCwd().value;
  if (initialCwd && fs.exists(initialCwd) && fs.stat(initialCwd).type === 'dir')
    fs.chdir(initialCwd);
  const env: ShellEnv = {
    user: 'hamed',
    host: siteHost(siteUrl),
    lang: 'en',
    theme: theme.value,
    siteUrl,
  };
  const cwdLabel = ref(fs.display(fs.cwd));

  const push = (line: OutputLine): void => {
    lines.value.push(line);
  };
  const clear = (): void => {
    lines.value = [];
  };

  const deps: ShellDeps = {
    fs,
    registry: createRegistry(commands),
    cv,
    env,
    sink: push,
    nextId: () => ++nextId,
    panel: { navigate: hooks.navigate, toggle: hooks.togglePanel, reveal: hooks.revealPanel },
    theme: { set: hooks.setTheme },
    lang: { set: hooks.setLang },
    ui: createTerminalUi(hooks, clear),
    history: history.list(),
  };
  const shell = new Shell(deps);
  const bridge = createAppBridge(shell, deps, createAppRegistry(appCommands), () => theme.value);

  const prompt = (): string => `${env.user}@${env.host}:${cwdLabel.value}$ `;

  function print(text: string, style?: LineStyle): void {
    push({ id: ++nextId, spans: text ? [{ text, style }] : [] });
  }

  function echo(line: string): void {
    push({ id: ++nextId, spans: [{ text: prompt(), style: 'prompt' }, { text: line }] });
  }

  async function run(line: string, opts: RunOptions = {}): Promise<void> {
    env.theme = theme.value;
    if (opts.echo !== false) echo(line);
    if (opts.record !== false) history.push(line);
    busy.value = true;
    controller = new AbortController();
    try {
      await shell.exec(line, controller.signal);
    } finally {
      busy.value = false;
      controller = null;
      cwdLabel.value = fs.display(fs.cwd);
    }
  }

  function abort(): void {
    controller?.abort();
  }

  function complete(line: string) {
    return completeLine(line, { fs, registry: deps.registry, cv });
  }

  return { lines, run, abort, clear, complete, history, cwdLabel, busy, prompt, print, bridge };
}
