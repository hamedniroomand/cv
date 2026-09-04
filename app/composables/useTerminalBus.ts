/**
 * Lets the panel hand a command to the terminal (e.g. clicking a file path runs `cat` on it).
 * The terminal drains `queue` when mounted; on mobile the shell switches to the terminal tab first.
 */
export function useTerminalBus() {
  const queue = useState<string[]>('terminal-queue', () => [])
  const requested = useState<number>('terminal-requested', () => 0)

  function run(command: string): void {
    queue.value = [...queue.value, command]
    requested.value++
  }

  function drain(): string[] {
    const items = queue.value
    queue.value = []
    return items
  }

  return { queue: readonly(queue), requested: readonly(requested), run, drain }
}
