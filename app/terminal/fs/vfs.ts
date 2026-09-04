import type { CompleteOptions, FsBase, FsDir, FsFile, FsNode, ReaddirOptions, ReadFileOptions, VirtualFS } from './types'
import { FsError } from './errors'

const DEFAULT_MTIME = '1970-01-01T00:00:00.000Z'

export function dir(name: string, children: FsNode[] = [], extra: Partial<FsBase> = {}): FsDir {
  return {
    type: 'dir',
    name,
    mode: 0o755,
    mtime: DEFAULT_MTIME,
    ...extra,
    children: new Map(children.map(c => [c.name, c])),
  }
}

export function file(name: string, content: string, extra: Partial<FsBase> & { exec?: boolean } = {}): FsFile {
  return {
    type: 'file',
    name,
    mode: extra.exec ? 0o755 : 0o644,
    mtime: DEFAULT_MTIME,
    ...extra,
    content,
    size: new TextEncoder().encode(content).length,
  }
}

function sortByName(nodes: FsNode[]): FsNode[] {
  // Byte order like `ls` in the C locale: dotfiles, then uppercase, then lowercase.
  return nodes.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
}

export class Vfs implements VirtualFS {
  readonly home: string
  private _cwd: string

  constructor(private readonly root: FsDir, opts: { home?: string, cwd?: string } = {}) {
    this.home = opts.home ?? '/home/hamed'
    this._cwd = opts.cwd ?? this.home
  }

  get cwd(): string {
    return this._cwd
  }

  resolve(path: string, from: string = this._cwd): string {
    let full: string
    if (path === '~' || path.startsWith('~/'))
      full = this.home + path.slice(1)
    else if (path.startsWith('/'))
      full = path
    else
      full = `${from}/${path}`

    const parts: string[] = []
    for (const seg of full.split('/')) {
      if (seg === '' || seg === '.')
        continue
      if (seg === '..')
        parts.pop()
      else
        parts.push(seg)
    }
    return `/${parts.join('/')}`
  }

  display(absPath: string): string {
    if (absPath === this.home)
      return '~'
    if (absPath.startsWith(`${this.home}/`))
      return `~${absPath.slice(this.home.length)}`
    return absPath
  }

  private lookup(path: string): FsNode | undefined {
    const abs = this.resolve(path)
    if (abs === '/')
      return this.root
    let node: FsNode = this.root
    for (const seg of abs.slice(1).split('/')) {
      if (node.type !== 'dir')
        throw new FsError('ENOTDIR', path)
      const next = node.children.get(seg)
      if (!next)
        return undefined
      node = next
    }
    return node
  }

  stat(path: string): FsNode {
    const node = this.lookup(path)
    if (!node)
      throw new FsError('ENOENT', path)
    return node
  }

  exists(path: string): boolean {
    try {
      return this.lookup(path) !== undefined
    }
    catch {
      return false
    }
  }

  readFile(path: string, opts: ReadFileOptions = {}): string {
    const node = this.stat(path)
    if (node.type === 'dir')
      throw new FsError('EISDIR', path)
    const worldReadable = (node.mode & 0o044) !== 0
    if (!worldReadable && !opts.sudo)
      throw new FsError('EACCES', path)
    return node.content
  }

  readdir(path: string, opts: ReaddirOptions = {}): FsNode[] {
    const node = this.stat(path)
    if (node.type !== 'dir')
      throw new FsError('ENOTDIR', path)
    const nodes = [...node.children.values()].filter(n => opts.all || !n.name.startsWith('.'))
    return sortByName(nodes)
  }

  chdir(path: string): void {
    const node = this.stat(path)
    if (node.type !== 'dir')
      throw new FsError('ENOTDIR', path)
    this._cwd = this.resolve(path)
  }

  walk(path: string, visit: (absPath: string, node: FsNode) => void): void {
    const start = this.resolve(path)
    const recurse = (abs: string, node: FsNode) => {
      visit(abs, node)
      if (node.type === 'dir') {
        for (const child of sortByName([...node.children.values()]))
          recurse(abs === '/' ? `/${child.name}` : `${abs}/${child.name}`, child)
      }
    }
    recurse(start, this.stat(path))
  }

  complete(partial: string, opts: CompleteOptions = {}): string[] {
    const slash = partial.lastIndexOf('/')
    const dirPart = slash >= 0 ? partial.slice(0, slash + 1) : ''
    const prefix = slash >= 0 ? partial.slice(slash + 1) : partial
    let entries: FsNode[]
    try {
      entries = this.readdir(dirPart || '.', { all: prefix.startsWith('.') })
    }
    catch {
      return []
    }
    return entries
      .filter(n => n.name.startsWith(prefix))
      .filter(n => !opts.dirsOnly || n.type === 'dir')
      .map(n => `${dirPart}${n.name}${n.type === 'dir' ? '/' : ''}`)
  }
}
