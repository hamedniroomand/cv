import type { CvData } from '#shared/schemas/cv'
import type { VirtualFS } from '../fs/types'
import type { LineSink } from '../io/writer'
import type { Command, CommandContext, CommandRegistry, NetContext, ShellEnv, TerminalUi } from '../types'
import type { Segment } from './parser'
import { CaptureWriter, LineWriter } from '../io/writer'
import { ShellSyntaxError } from './errors'
import { parse } from './parser'

export interface ShellDeps {
  fs: VirtualFS
  registry: CommandRegistry
  cv: CvData
  env: ShellEnv
  sink: LineSink
  nextId: () => number
  panel: CommandContext['panel']
  theme: CommandContext['theme']
  lang: CommandContext['lang']
  ui: TerminalUi
  net: NetContext
  history: readonly string[]
}

export interface ExecResult {
  code: number
}

export interface ShellOutput {
  sink: LineSink
  nextId: () => number
}

const EXIT_SYNTAX = 2
const EXIT_NOT_FOUND = 127

/** Runs parsed pipelines against the command registry. */
export class Shell {
  constructor(private readonly deps: ShellDeps) {}

  async exec(
    line: string,
    signal: AbortSignal = new AbortController().signal,
    output?: ShellOutput,
  ): Promise<ExecResult> {
    const { sink, nextId } = output ?? this.deps
    const stderr = new LineWriter(sink, nextId, 'error')
    let segments: Segment[]
    try {
      segments = parse(line).segments
    }
    catch (err) {
      if (err instanceof ShellSyntaxError) {
        stderr.line(`bash: ${err.message}`)
        return { code: EXIT_SYNTAX }
      }
      throw err
    }
    if (segments.length === 0)
      return { code: 0 }

    let code = 0
    let piped: string | null = null
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!
      const isLast = i === segments.length - 1
      const stdout = isLast ? new LineWriter(sink, nextId) : new CaptureWriter()

      code = await this.runSegment(seg, piped, stdout, stderr, signal)

      stdout.flush()
      stderr.flush()
      piped = stdout instanceof CaptureWriter ? stdout.text() : null
    }
    return { code }
  }

  private async runSegment(seg: Segment, stdin: string | null, stdout: LineWriter | CaptureWriter, stderr: LineWriter, signal: AbortSignal): Promise<number> {
    const argv0 = seg.argv[0]
    if (argv0 === undefined) {
      stderr.line('usage: sudo <command>')
      return 1
    }
    const command: Command | undefined = this.deps.registry.get(argv0)
    if (!command) {
      stderr.line(`bash: ${argv0}: command not found`)
      return EXIT_NOT_FOUND
    }
    const ctx: CommandContext = {
      fs: this.deps.fs,
      stdin,
      stdout,
      stderr,
      argv0,
      sudo: seg.sudo,
      env: this.deps.env,
      cv: this.deps.cv,
      panel: this.deps.panel,
      theme: this.deps.theme,
      lang: this.deps.lang,
      history: this.deps.history,
      registry: this.deps.registry,
      ui: this.deps.ui,
      net: this.deps.net,
      signal,
    }
    try {
      return await command.run(seg.argv.slice(1), ctx)
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      stderr.line(`${argv0}: ${message}`)
      return 1
    }
  }
}
