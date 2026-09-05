export interface DotfilePathParts {
  dirs: string[];
  name: string;
}

/** Splits `~/a/b/file` into `{ dirs: ['a', 'b'], name: 'file' }`. The path must be valid. */
export function splitDotfilePath(path: string): DotfilePathParts {
  const segments = path.slice(2).split('/');
  const name = segments.pop()!;
  return { dirs: segments, name };
}

/** Returns the directory of a dotfile as a tilde path. Returns `~` for a file in the home directory. */
export function dotfileDir(path: string): string {
  const { dirs } = splitDotfilePath(path);
  return dirs.length === 0 ? '~' : `~/${dirs.join('/')}`;
}
