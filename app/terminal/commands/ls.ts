import type { FsNode } from '../fs/types'
import type { Command, CommandContext } from '../types'
import { fsErrorMessage, isFsError } from '../fs/errors'
import { parseFlags } from '../shell/flags'
import { navigateFor } from './_util'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function perms(node: FsNode): string {
  const bits = (m: number) => `${m & 4 ? 'r' : '-'}${m & 2 ? 'w' : '-'}${m & 1 ? 'x' : '-'}`
  const type = node.type === 'dir' ? 'd' : '-'
  return `${type}${bits(node.mode >> 6)}${bits((node.mode >> 3) & 7)}${bits(node.mode & 7)}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2)} ${d.getUTCFullYear()}`
}

function printNodes(ctx: CommandContext, nodes: FsNode[], long: boolean): void {
  if (long) {
    for (const n of nodes) {
      const size = n.type === 'file' ? n.size : 4096
      ctx.stdout.write(`${perms(n)}  1 hamed hamed ${String(size).padStart(6)} ${formatDate(n.mtime)} `)
      ctx.stdout.line(n.type === 'dir' ? n.name : n.name, n.type === 'dir' ? 'accent' : undefined)
    }
    return
  }
  nodes.forEach((n, i) => {
    if (i > 0)
      ctx.stdout.write('  ')
    ctx.stdout.write(n.type === 'dir' ? `${n.name}/` : n.name, n.type === 'dir' ? 'accent' : undefined)
  })
  if (nodes.length > 0)
    ctx.stdout.line()
}

export default {
  name: 'ls',
  aliases: ['ll', 'dir'],
  description: 'List directory contents',
  usage: 'ls [-la] [path...]',
  run(argv, ctx) {
    const { flags, positionals } = parseFlags(argv, { boolean: ['l', 'a'] })
    const long = flags.has('l') || ctx.argv0 === 'll'
    const all = flags.has('a')
    const paths = positionals.length > 0 ? positionals : ['.']
    let code = 0

    paths.forEach((path, i) => {
      let node: FsNode
      try {
        node = ctx.fs.stat(path)
      }
      catch (err) {
        if (!isFsError(err))
          throw err
        ctx.stderr.line(`ls: cannot access '${path}': ${fsErrorMessage('', err).replace(/^: [^:]+: /, '')}`)
        code = 2
        return
      }
      if (positionals.length > 1) {
        if (i > 0)
          ctx.stdout.line()
        ctx.stdout.line(`${path}:`)
      }
      if (node.type === 'file')
        printNodes(ctx, [node], long)
      else
        printNodes(ctx, ctx.fs.readdir(path, { all }), long)
    })

    if (positionals.length === 1)
      navigateFor(ctx, positionals[0]!)
    return code
  },
} satisfies Command
