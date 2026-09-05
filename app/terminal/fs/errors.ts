export type FsErrorCode = 'ENOENT' | 'EACCES' | 'ENOTDIR' | 'EISDIR';

const REASONS: Record<FsErrorCode, string> = {
  ENOENT: 'No such file or directory',
  EACCES: 'Permission denied',
  ENOTDIR: 'Not a directory',
  EISDIR: 'Is a directory',
};

export class FsError extends Error {
  constructor(
    public readonly code: FsErrorCode,
    public readonly path: string,
  ) {
    super(`${path}: ${REASONS[code]}`);
    this.name = 'FsError';
  }
}

export function fsErrorReason(err: FsError): string {
  return REASONS[err.code];
}

export function fsErrorMessage(cmd: string, err: FsError): string {
  return `${cmd}: ${err.path}: ${fsErrorReason(err)}`;
}

export function isFsError(err: unknown): err is FsError {
  return err instanceof FsError;
}
