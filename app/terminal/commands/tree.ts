import type { FsDir, FsNode } from '~/terminal/fs/types'
import type { Command, CommandContext } from '~/terminal/types'
import { isHidden, sortByName } from '~/terminal/fs/vfs'
import { navigateFor, reportFsError } from './_util'

interface Counts {
  dirs: number
  files: number
}

function visibleChildren(dir: FsDir): FsNode[] {
  return sortByName([...dir.children.values()].filter(node => !isHidden(node)))
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

function printBranch(ctx: CommandContext, dir: FsDir, indent: string, counts: Counts): void {
  const children = visibleChildren(dir)
  children.forEach((child, index) => {
    const last = index === children.length - 1
    ctx.stdout.write(`${indent}${last ? '└── ' : '├── '}`, 'dim')
    if (child.type === 'file') {
      counts.files++
      ctx.stdout.line(child.name)
      return
    }
    counts.dirs++
    ctx.stdout.line(child.name, 'accent')
    printBranch(ctx, child, `${indent}${last ? '    ' : '│   '}`, counts)
  })
}

export default {
  name: 'tree',
  description: 'Show the directory tree',
  usage: 'tree [path]',
  complete: (argv, ctx) => ctx.fs.complete(argv[argv.length - 1] ?? '', { dirsOnly: true }),
  run(argv, ctx) {
    const path = argv[0] ?? '.'
    let node: FsNode
    try {
      node = ctx.fs.stat(path)
    }
    catch (err) {
      return reportFsError(ctx, err)
    }
    if (node.type === 'file') {
      ctx.stdout.line(path)
      ctx.stdout.line()
      ctx.stdout.line('0 directories, 1 file')
      return 0
    }

    const counts: Counts = { dirs: 0, files: 0 }
    ctx.stdout.line(path, 'accent')
    printBranch(ctx, node, '', counts)
    ctx.stdout.line()
    ctx.stdout.line(`${plural(counts.dirs, 'directory', 'directories')}, ${plural(counts.files, 'file', 'files')}`)
    navigateFor(ctx, path)
    return 0
  },
} satisfies Command
