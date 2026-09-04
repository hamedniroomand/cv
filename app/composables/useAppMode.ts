export function useAppMode() {
  const open = ref(false)
  let pending: Promise<void> | null = null
  let resolvePending: (() => void) | null = null

  function request(): Promise<void> {
    if (pending)
      return pending
    open.value = true
    pending = new Promise<void>((resolve) => {
      resolvePending = resolve
    })
    return pending
  }

  function close(): void {
    if (!open.value)
      return
    open.value = false
    resolvePending?.()
    resolvePending = null
    pending = null
  }

  return { open: readonly(open), request, close }
}
