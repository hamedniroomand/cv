import { buildTree, HOME } from '#shared/cv/build-tree';
import type { PanelTarget } from '#shared/cv/panel-target';
import { Vfs } from '~/terminal/fs/vfs';
import type { ShellDeps } from '~/terminal/shell/executor';
import { Shell } from '~/terminal/shell/executor';
import { createRegistry } from '~/terminal/shell/registry';
import type { Command, CompletionContext, OutputLine } from '~/terminal/types';

import { fixtureCv } from './cv';
import { joinLines } from './output';

export interface ShellCalls {
  navigate: PanelTarget[];
  toggled: number;
  apps: number;
  opened: string[];
  downloads: string[];
  modals: string[];
  cleared: number;
  destroyed: number;
  themes: string[];
  langs: string[];
}

function emptyCalls(): ShellCalls {
  return {
    navigate: [],
    toggled: 0,
    apps: 0,
    opened: [],
    downloads: [],
    modals: [],
    cleared: 0,
    destroyed: 0,
    themes: [],
    langs: [],
  };
}

export function makeShell(commands: Command[], overrides: Partial<ShellDeps> = {}) {
  const lines: OutputLine[] = [];
  const calls = emptyCalls();
  const history: string[] = [];
  let id = 0;

  const deps: ShellDeps = {
    fs: new Vfs(buildTree(fixtureCv), { home: HOME }),
    registry: createRegistry(commands),
    cv: fixtureCv,
    env: {
      user: 'hamed',
      host: 'hamed.sh',
      lang: 'en',
      theme: 'dark',
      siteUrl: 'https://hamed.test',
    },
    sink: line => lines.push(line),
    nextId: () => ++id,
    panel: { navigate: target => calls.navigate.push(target), toggle: () => calls.toggled++ },
    theme: { set: name => calls.themes.push(name) },
    lang: { set: lang => calls.langs.push(lang) },
    ui: {
      clear: () => calls.cleared++,
      openApp: async () => {
        calls.apps++;
      },
      openModal: async kind => {
        calls.modals.push(kind);
      },
      openUrl: url => calls.opened.push(url),
      download: url => calls.downloads.push(url),
      destroy: () => calls.destroyed++,
    },
    history,
    ...overrides,
  };
  const shell = new Shell(deps);
  const completion: CompletionContext = { fs: deps.fs, registry: deps.registry, cv: deps.cv };

  return {
    shell,
    exec: (line: string) => shell.exec(line),
    lines,
    text: () => joinLines(lines),
    calls,
    history,
    deps,
    completion,
  };
}
