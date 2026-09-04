import type { Json } from '../jq/eval'
import type { Command } from '../types'
import { evalJq, formatJson, JqRuntimeError } from '../jq/eval'
import { JqSyntaxError, parseJq } from '../jq/parse'
import { parseFlags } from '../shell/flags'
import { reportFsError } from './_util'

export default {
  name: 'jq',
  description: 'Filter JSON data',
  usage: 'jq [-rc] <filter> [file]',
  run(argv, ctx) {
    const { flags, positionals, unknown } = parseFlags(argv, { boolean: ['r', 'c'] })
    const [filter, file, extra] = positionals
    if (unknown.length > 0 || filter === undefined || extra !== undefined) {
      ctx.stderr.line('usage: jq [-rc] <filter> [file]')
      return 2
    }

    let node
    try {
      node = parseJq(filter)
    }
    catch (err) {
      if (!(err instanceof JqSyntaxError))
        throw err
      ctx.stderr.line(`jq: error: ${err.message}`)
      return 3
    }

    let text: string
    if (file !== undefined) {
      try {
        text = ctx.fs.readFile(file, { sudo: ctx.sudo })
      }
      catch (err) {
        return reportFsError(ctx, err)
      }
    }
    else if (ctx.stdin !== null) {
      text = ctx.stdin
    }
    else {
      ctx.stderr.line('usage: jq [-rc] <filter> [file]')
      return 2
    }

    let input: Json
    try {
      input = JSON.parse(text) as Json
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      ctx.stderr.line(`jq: parse error: ${message}`)
      return 2
    }

    try {
      for (const output of evalJq(node, input))
        ctx.stdout.line(formatJson(output, { raw: flags.has('r'), compact: flags.has('c') }))
      return 0
    }
    catch (err) {
      if (!(err instanceof JqRuntimeError))
        throw err
      ctx.stderr.line(`jq: error: ${err.message}`)
      return 3
    }
  },
} satisfies Command
