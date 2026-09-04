import type { PanelTarget } from '#shared/cv/panel-target'

export interface FsBase {
  name: string
  /** POSIX-style mode: 0o644 files, 0o755 dirs, 0o600 for files that need sudo. */
  mode: number
  /** ISO timestamp. */
  mtime: string
  /** Which part of the resume panel this node corresponds to. */
  panel?: PanelTarget
}

export interface FsFile extends FsBase {
  type: 'file'
  content: string
  /** Byte size of `content` (UTF-8). */
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
  /** Include dotfiles. */
  all?: boolean
}

export interface CompleteOptions {
  dirsOnly?: boolean
}

export interface VirtualFS {
  readonly home: string
  readonly cwd: string
  /** Expand `~`, `.`, `..`, duplicate and trailing slashes into an absolute path. */
  resolve: (path: string, from?: string) => string
  /** Absolute path shown with the home directory collapsed to `~`. */
  display: (absPath: string) => string
  stat: (path: string) => FsNode
  exists: (path: string) => boolean
  readFile: (path: string, opts?: ReadFileOptions) => string
  readdir: (path: string, opts?: ReaddirOptions) => FsNode[]
  chdir: (path: string) => void
  /** Depth-first visit of the node at `path` and everything under it. */
  walk: (path: string, visit: (absPath: string, node: FsNode) => void) => void
  /** Tab-completion candidates for a partial path, keeping the prefix the user typed. */
  complete: (partial: string, opts?: CompleteOptions) => string[]
}
