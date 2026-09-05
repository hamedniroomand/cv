/** The directory in which the terminal starts. A page sets it. `useShell` reads it one time. */
export function useTerminalCwd() {
  return useState<string | null>('terminal-initial-cwd', () => null);
}
