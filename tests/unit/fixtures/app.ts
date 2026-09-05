import { commands as shellCommands } from '~/terminal/commands';
import type { ThemeName } from '~/terminal/types';
import { createAppBridge } from '~/tui/bridge';
import { commands as defaultAppCommands } from '~/tui/commands';
import { createAppRegistry } from '~/tui/registry';
import { createAppRunner } from '~/tui/runner';
import type { AppCommand, AppContext, PickerItem, PickOptions, View } from '~/tui/types';
import { createPrinter } from '~/tui/view';

import { makeShell } from './context';

interface AppOptions {
  commands?: AppCommand[];
  picks?: Array<string | null>;
}

interface PickCall {
  title: string;
  items: PickerItem[];
  opts?: PickOptions<unknown>;
}

type BaseContext = Omit<AppContext, 'argv0' | 'registry' | 'shell' | 'signal' | 'slash' | 'sudo'>;

export function makeApp({ commands = [], picks = [] }: AppOptions = {}) {
  const shellFixture = makeShell(shellCommands);
  const { deps, lines } = shellFixture;
  const shellCalls: string[] = [];
  const pickCalls: PickCall[] = [];
  const calls = {
    ...shellFixture.calls,
    shell: shellCalls,
    pick: pickCalls,
    cleared: 0,
    statuses: [] as string[],
    exits: 0,
  };
  let nextViewId = 10_000;
  const nextId = (): number => ++nextViewId;

  const view: View = {
    print: createPrinter(line => lines.push(line), nextId),
    clear: () => {
      calls.cleared++;
      lines.splice(0);
    },
    pick: async <T>(title: string, items: PickerItem<T>[], opts?: PickOptions<T>) => {
      pickCalls.push({ title, items: items as PickerItem[], opts });
      return (picks.shift() ?? null) as T | null;
    },
    status: text => calls.statuses.push(text),
    exit: () => {
      calls.exits++;
    },
  };

  deps.panel.toggle = () => {
    calls.toggled++;
  };
  deps.panel.reveal = () => {
    calls.revealed++;
  };

  let liveTheme: ThemeName = deps.env.theme;
  const applyTheme = deps.theme.set;
  deps.theme.set = name => {
    liveTheme = name;
    applyTheme(name);
  };

  const registry = createAppRegistry([...defaultAppCommands, ...commands]);
  const bridge = createAppBridge(shellFixture.shell, deps, registry, () => liveTheme);
  const context: BaseContext = { ...bridge.context, view };
  const runner = createAppRunner({
    registry,
    context,
    shell: async (line, signal) => {
      shellCalls.push(line);
      return bridge.exec(line, output => lines.push(output), nextId, signal);
    },
  });

  function complete(name: string, argv: string[] = []): PickerItem[] {
    const command = registry.get(name);
    if (!command?.complete) return [];
    const signal = new AbortController().signal;
    const ctx: AppContext = {
      ...context,
      argv0: `/${name}`,
      registry,
      sudo: false,
      signal,
      shell: async line => {
        shellCalls.push(line);
        return (await shellFixture.shell.exec(line, signal)).code;
      },
      slash: line => runner.run(line, signal),
    };
    return command.complete(argv, ctx);
  }

  return {
    run: (line: string) => runner.run(line, new AbortController().signal),
    text: shellFixture.text,
    lines,
    command: (name: string) => registry.get(name),
    complete,
    calls,
  };
}
