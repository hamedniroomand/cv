import type { CompleteOptions, FsBase, FsDir, FsFile, FsNode, ReaddirOptions, ReadFileOptions, VirtualFS } from './types'
import { byteLength } from '../io/text'
import { FsError } from './errors'

const DEFAULT_MTIME = '1970-01-01T00:00:00.000Z'
const WORLD_READ_BITS = 0o044

export function dir(name: string, children: FsNode[] = [], extra: Partial<FsBase> = {}): FsDir {
  return {
    type: 'dir',
    name,
    mode: 0o755,
    mtime: DEFAULT_MTIME,
    ...extra,
    children: new Map(children.map(child => [child.name, child])),
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
    size: byteLength(content),
  }
}

export function sortByName(nodes: FsNode[]): FsNode[] {
  return nodes.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
}

export function isHidden(node: FsNode): boolean {
  return node.name.startsWith('.')
}

function joinPath(base: string, name: string): string {
  return base === '/' ? `/${name}` : `${base}/${name}`
}

export class Vfs implements VirtualFS {
  readonly home: string
  private currentDir: string

  constructor(private readonly root: FsDir, opts: { home?: string, cwd?: string } = {}) {
    this.home = opts.home ?? '/home/hamed'
    this.currentDir = opts.cwd ?? this.home
  }

  get cwd(): string {
    return this.currentDir
  }

  resolve(path: string, from: string = this.currentDir): string {
    const parts: string[] = []
    for (const segment of this.expand(path, from).split('/')) {
      if (segment === '' || segment === '.')
        continue
      if (segment === '..')
        parts.pop()
      else
        parts.push(segment)
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
    const worldReadable = (node.mode & WORLD_READ_BITS) !== 0
    if (!worldReadable && !opts.sudo)
      throw new FsError('EACCES', path)
    return node.content
  }

  readdir(path: string, opts: ReaddirOptions = {}): FsNode[] {
    const nodes = [...this.statDir(path).children.values()]
    return sortByName(opts.all ? nodes : nodes.filter(node => !isHidden(node)))
  }

  chdir(path: string): void {
    this.statDir(path)
    this.currentDir = this.resolve(path)
  }

  walk(path: string, visit: (absPath: string, node: FsNode) => void): void {
    const recurse = (abs: string, node: FsNode): void => {
      visit(abs, node)
      if (node.type !== 'dir')
        return
      for (const child of sortByName([...node.children.values()]))
        recurse(joinPath(abs, child.name), child)
    }
    recurse(this.resolve(path), this.stat(path))
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
      .filter(node => node.name.startsWith(prefix))
      .filter(node => !opts.dirsOnly || node.type === 'dir')
      .map(node => `${dirPart}${node.name}${node.type === 'dir' ? '/' : ''}`)
  }

  private expand(path: string, from: string): string {
    if (path === '~' || path.startsWith('~/'))
      return this.home + path.slice(1)
    if (path.startsWith('/'))
      return path
    return `${from}/${path}`
  }

  private lookup(path: string): FsNode | undefined {
    const abs = this.resolve(path)
    if (abs === '/')
      return this.root
    let node: FsNode = this.root
    for (const segment of abs.slice(1).split('/')) {
      if (node.type !== 'dir')
        throw new FsError('ENOTDIR', path)
      const next = node.children.get(segment)
      if (!next)
        return undefined
      node = next
    }
    return node
  }

  private statDir(path: string): FsDir {
    const node = this.stat(path)
    if (node.type !== 'dir')
      throw new FsError('ENOTDIR', path)
    return node
  }
}
