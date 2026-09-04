import type { CvData } from '#shared/schemas/cv'
import type { VirtualFS } from '../fs/types'
import type { LineSink } from '../io/writer'
import type { CommandContext, CommandRegistry, ShellEnv, TerminalUi, Writer } from '../types'
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
  history: readonly string[]
}

export interface ExecResult {
  code: number
}

export interface ShellOutput {
  sink: LineSink
  nextId: () => number
}

interface SegmentIo {
  stdin: string | null
  stdout: Writer
  stderr: Writer
  tty: boolean
  signal: AbortSignal
}

const EXIT_SYNTAX = 2
const EXIT_NOT_FOUND = 127

export class Shell {
  constructor(private readonly deps: ShellDeps) {}

  async exec(
    line: string,
    signal: AbortSignal = new AbortController().signal,
    output: ShellOutput = this.deps,
  ): Promise<ExecResult> {
    const stderr = new LineWriter(output.sink, output.nextId, 'error')
    const segments = this.parseLine(line, stderr)
    if (segments === null)
      return { code: EXIT_SYNTAX }

    let code = 0
    let piped: string | null = null
    for (const [index, segment] of segments.entries()) {
      const tty = index === segments.length - 1
      const stdout = tty ? new LineWriter(output.sink, output.nextId) : new CaptureWriter()
      code = await this.runSegment(segment, { stdin: piped, stdout, stderr, tty, signal })
      stdout.flush()
      stderr.flush()
      piped = stdout instanceof CaptureWriter ? stdout.text() : null
    }
    return { code }
  }

  private parseLine(line: string, stderr: Writer): Segment[] | null {
    try {
      return parse(line).segments
    }
    catch (err) {
      if (!(err instanceof ShellSyntaxError))
        throw err
      stderr.line(`bash: ${err.message}`)
      return null
    }
  }

  private async runSegment(segment: Segment, io: SegmentIo): Promise<number> {
    const argv0 = segment.argv[0]
    if (argv0 === undefined) {
      io.stderr.line('usage: sudo <command>')
      return 1
    }
    const command = this.deps.registry.get(argv0)
    if (!command) {
      io.stderr.line(`bash: ${argv0}: command not found`)
      return EXIT_NOT_FOUND
    }
    try {
      return await command.run(segment.argv.slice(1), this.contextFor(argv0, segment.sudo, io))
    }
    catch (err) {
      io.stderr.line(`${argv0}: ${err instanceof Error ? err.message : String(err)}`)
      return 1
    }
  }

  private contextFor(argv0: string, sudo: boolean, io: SegmentIo): CommandContext {
    const { fs, env, cv, panel, theme, lang, history, registry, ui } = this.deps
    return { ...io, argv0, sudo, fs, env, cv, panel, theme, lang, history, registry, ui }
  }
}
