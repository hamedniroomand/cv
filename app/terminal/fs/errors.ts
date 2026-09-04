export type FsErrorCode = 'ENOENT' | 'EACCES' | 'ENOTDIR' | 'EISDIR'

const MESSAGES: Record<FsErrorCode, string> = {
  ENOENT: 'No such file or directory',
  EACCES: 'Permission denied',
  ENOTDIR: 'Not a directory',
  EISDIR: 'Is a directory',
}

export class FsError extends Error {
  constructor(public readonly code: FsErrorCode, public readonly path: string) {
    super(`${path}: ${MESSAGES[code]}`)
    this.name = 'FsError'
  }
}

/** `cat: .secrets: Permission denied` style message. */
export function fsErrorMessage(cmd: string, err: FsError): string {
  return `${cmd}: ${err.path}: ${MESSAGES[err.code]}`
}

export function isFsError(err: unknown): err is FsError {
  return err instanceof FsError
}
