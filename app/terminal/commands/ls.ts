import type { FsNode } from '~/terminal/fs/types'
import type { Command, CommandContext, LineStyle } from '~/terminal/types'
import { fsErrorReason, isFsError } from '~/terminal/fs/errors'
import { parseFlags } from '~/terminal/shell/flags'
import { navigateFor } from './_util'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DIR_SIZE = 4096
const EXIT_ACCESS = 2

function permissionBits(mode: number): string {
  return `${mode & 4 ? 'r' : '-'}${mode & 2 ? 'w' : '-'}${mode & 1 ? 'x' : '-'}`
}

function permissions(node: FsNode): string {
  const type = node.type === 'dir' ? 'd' : '-'
  return `${type}${permissionBits(node.mode >> 6)}${permissionBits((node.mode >> 3) & 7)}${permissionBits(node.mode & 7)}`
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return `${MONTHS[date.getUTCMonth()]} ${String(date.getUTCDate()).padStart(2)} ${date.getUTCFullYear()}`
}

function styleFor(node: FsNode): LineStyle | undefined {
  return node.type === 'dir' ? 'accent' : undefined
}

function printLong(ctx: CommandContext, nodes: FsNode[]): void {
  for (const node of nodes) {
    const size = node.type === 'file' ? node.size : DIR_SIZE
    ctx.stdout.write(`${permissions(node)}  1 hamed hamed ${String(size).padStart(6)} ${formatDate(node.mtime)} `)
    ctx.stdout.line(node.name, styleFor(node))
  }
}

function printShort(ctx: CommandContext, nodes: FsNode[]): void {
  nodes.forEach((node, index) => {
    if (index > 0)
      ctx.stdout.write('  ')
    ctx.stdout.write(node.type === 'dir' ? `${node.name}/` : node.name, styleFor(node))
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
    const print = long ? printLong : printShort
    let code = 0

    paths.forEach((path, index) => {
      let node: FsNode
      try {
        node = ctx.fs.stat(path)
      }
      catch (err) {
        if (!isFsError(err))
          throw err
        ctx.stderr.line(`ls: cannot access '${path}': ${fsErrorReason(err)}`)
        code = EXIT_ACCESS
        return
      }
      if (paths.length > 1) {
        if (index > 0)
          ctx.stdout.line()
        ctx.stdout.line(`${path}:`)
      }
      print(ctx, node.type === 'file' ? [node] : ctx.fs.readdir(path, { all }))
    })

    if (positionals.length === 1)
      navigateFor(ctx, positionals[0]!)
    return code
  },
} satisfies Command
