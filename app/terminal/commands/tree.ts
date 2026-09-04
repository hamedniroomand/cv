import type { FsDir } from '../fs/types'
import type { Command, CommandContext } from '../types'
import { navigateFor, reportFsError } from './_util'

export default {
  name: 'tree',
  description: 'Show the directory tree',
  usage: 'tree [path]',
  complete: (argv, ctx) => ctx.fs.complete(argv[argv.length - 1] ?? '', { dirsOnly: true }),
  run(argv, ctx) {
    const path = argv[0] ?? '.'
    let root: FsDir
    try {
      const node = ctx.fs.stat(path)
      if (node.type !== 'dir') {
        ctx.stdout.line(path)
        ctx.stdout.line()
        ctx.stdout.line('0 directories, 1 file')
        return 0
      }
      root = node
    }
    catch (err) {
      return reportFsError(ctx, err)
    }

    const counts = { dirs: 0, files: 0 }
    ctx.stdout.line(path, 'accent')
    walk(ctx, root, '', counts)
    ctx.stdout.line()
    ctx.stdout.line(`${counts.dirs} ${counts.dirs === 1 ? 'directory' : 'directories'}, ${counts.files} ${counts.files === 1 ? 'file' : 'files'}`)
    navigateFor(ctx, path)
    return 0
  },
} satisfies Command

function walk(ctx: CommandContext, dir: FsDir, indent: string, counts: { dirs: number, files: number }): void {
  const children = [...dir.children.values()]
    .filter(n => !n.name.startsWith('.'))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
  children.forEach((child, i) => {
    const last = i === children.length - 1
    ctx.stdout.write(`${indent}${last ? '└── ' : '├── '}`, 'dim')
    if (child.type === 'dir') {
      counts.dirs++
      ctx.stdout.line(child.name, 'accent')
      walk(ctx, child, `${indent}${last ? '    ' : '│   '}`, counts)
    }
    else {
      counts.files++
      ctx.stdout.line(child.name)
    }
  })
}
