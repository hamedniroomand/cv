import type { PanelTarget } from '#shared/cv/panel-target'

export interface FsBase {
  name: string
  mode: number
  mtime: string
  panel?: PanelTarget
}

export interface FsFile extends FsBase {
  type: 'file'
  content: string
  size: number
  exec?: boolean
}

export interface FsDir extends FsBase {
  type: 'dir'
  children: Map<string, FsNode>
}

export type FsNode = FsFile | FsDir

export interface ReadFileOptions {
  sudo?: boolean
}

export interface ReaddirOptions {
  all?: boolean
}

export interface CompleteOptions {
  dirsOnly?: boolean
}

export interface VirtualFS {
  readonly home: string
  readonly cwd: string
  resolve: (path: string, from?: string) => string
  display: (absPath: string) => string
  stat: (path: string) => FsNode
  exists: (path: string) => boolean
  readFile: (path: string, opts?: ReadFileOptions) => string
  readdir: (path: string, opts?: ReaddirOptions) => FsNode[]
  chdir: (path: string) => void
  walk: (path: string, visit: (absPath: string, node: FsNode) => void) => void
  complete: (partial: string, opts?: CompleteOptions) => string[]
}
