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
