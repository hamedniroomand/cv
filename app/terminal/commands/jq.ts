import type { Json } from '../jq/eval'
import type { JqNode } from '../jq/parse'
import type { Command, CommandContext } from '../types'
import { evalJq, formatJson, JqRuntimeError } from '../jq/eval'
import { JqSyntaxError, parseJq } from '../jq/parse'
import { parseFlags } from '../shell/flags'
import { printUsage, reportFsError } from './_util'

const EXIT_USAGE = 2
const EXIT_FILTER = 3

function reportJqError(ctx: CommandContext, err: unknown): number {
  if (!(err instanceof JqSyntaxError) && !(err instanceof JqRuntimeError))
    throw err
  ctx.stderr.line(`jq: error: ${err.message}`)
  return EXIT_FILTER
}

function parseFilter(ctx: CommandContext, filter: string): JqNode | number {
  try {
    return parseJq(filter)
  }
  catch (err) {
    return reportJqError(ctx, err)
  }
}

function readSource(ctx: CommandContext, file: string | undefined): string | number {
  if (file !== undefined) {
    try {
      return ctx.fs.readFile(file, { sudo: ctx.sudo })
    }
    catch (err) {
      return reportFsError(ctx, err)
    }
  }
  if (ctx.stdin !== null)
    return ctx.stdin
  return printUsage(ctx, EXIT_USAGE)
}

function parseInput(ctx: CommandContext, text: string): Json | undefined {
  try {
    return JSON.parse(text) as Json
  }
  catch (err) {
    ctx.stderr.line(`jq: parse error: ${err instanceof Error ? err.message : String(err)}`)
    return undefined
  }
}

export default {
  name: 'jq',
  description: 'Filter JSON data',
  usage: 'jq [-rc] <filter> [file]',
  run(argv, ctx) {
    const { flags, positionals, unknown } = parseFlags(argv, { boolean: ['r', 'c'] })
    const [filter, file, extra] = positionals
    if (unknown.length > 0 || filter === undefined || extra !== undefined)
      return printUsage(ctx, EXIT_USAGE)

    const node = parseFilter(ctx, filter)
    if (typeof node === 'number')
      return node
    const text = readSource(ctx, file)
    if (typeof text === 'number')
      return text
    const input = parseInput(ctx, text)
    if (input === undefined)
      return EXIT_USAGE

    try {
      for (const output of evalJq(node, input))
        ctx.stdout.line(formatJson(output, { raw: flags.has('r'), compact: flags.has('c') }))
      return 0
    }
    catch (err) {
      return reportJqError(ctx, err)
    }
  },
} satisfies Command
