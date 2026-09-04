import type { LineStyle, Span } from '~/terminal/types'
import type { AppCommand, AppContext, PickerItem, View } from '~/tui/types'
import { commands as shellCommands } from '~/terminal/commands'
import { LineWriter } from '~/terminal/io/writer'
import about from '~/tui/commands/about'
import education from '~/tui/commands/education'
import experience from '~/tui/commands/experience'
import projects from '~/tui/commands/projects'
import skills from '~/tui/commands/skills'
import { createAppRegistry } from '~/tui/registry'
import { createAppRunner } from '~/tui/runner'
import { makeShell } from './context'

interface AppOptions {
  commands?: AppCommand[]
  picks?: Array<string | null>
}

interface PickCall {
  title: string
  items: PickerItem[]
  opts?: { initial?: unknown, placeholder?: string }
}

/** Build the app command runner over the real fixture VFS, CV, and shell. */
export function makeApp({ commands = [], picks = [] }: AppOptions = {}) {
  const shellFixture = makeShell(shellCommands)
  const shellCalls: string[] = []
  const pickCalls: PickCall[] = []
  const calls = {
    ...shellFixture.calls,
    shell: shellCalls,
    pick: pickCalls,
    cleared: 0,
    statuses: [] as string[],
    exits: 0,
  }
  let nextViewId = 10_000

  const print = (value: Span[] | string, style?: LineStyle) => {
    const writer = new LineWriter(line => shellFixture.lines.push(line), () => ++nextViewId)
    if (typeof value === 'string')
      writer.write(value, style)
    else
      writer.raw(value)
    writer.flush()
  }

  const view: View = {
    print,
    clear: () => {
      calls.cleared++
      shellFixture.lines.splice(0)
    },
    pick: async <T>(title: string, items: PickerItem<T>[], opts?: { initial?: T, placeholder?: string }) => {
      pickCalls.push({ title, items: items as PickerItem[], opts })
      return (picks.shift() ?? null) as T | null
    },
    status: text => calls.statuses.push(text),
    exit: () => {
      calls.exits++
    },
  }

  const appCommands: AppCommand[] = [about, experience, projects, skills, education, ...commands]
  const registry = createAppRegistry(appCommands)
  const deps = shellFixture.deps
  const context: Omit<AppContext, 'argv0' | 'shell' | 'signal' | 'slash' | 'sudo'> = {
    fs: deps.fs,
    env: deps.env,
    cv: deps.cv,
    panel: deps.panel,
    theme: deps.theme,
    lang: deps.lang,
    history: deps.history,
    registry: deps.registry,
    ui: deps.ui,
    net: deps.net,
    view,
  }
  const runner = createAppRunner({
    registry,
    context,
    shell: async (line, signal) => {
      shellCalls.push(line)
      return (await shellFixture.shell.exec(line, signal)).code
    },
  })
  const completion = (name: string, argv: string[] = []) => {
    const command = registry.get(name)
    if (!command?.complete)
      return []
    const signal = new AbortController().signal
    const ctx: AppContext = {
      ...context,
      argv0: `/${name}`,
      sudo: false,
      signal,
      shell: async (line) => {
        shellCalls.push(line)
        return (await shellFixture.shell.exec(line, signal)).code
      },
      slash: line => runner.run(line, signal),
    }
    return command.complete(argv, ctx)
  }

  return {
    run: (line: string) => runner.run(line, new AbortController().signal),
    text: shellFixture.text,
    command: (name: string) => registry.get(name),
    complete: completion,
    calls,
  }
}
