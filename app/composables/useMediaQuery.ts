/** Reactive `matchMedia`. `fallback` is used during SSR and before hydration. */
export function useMediaQuery(query: string, fallback = false) {
  const matches = ref(fallback)
  if (import.meta.client) {
    const mq = window.matchMedia(query)
    matches.value = mq.matches
    const onChange = (e: MediaQueryListEvent) => {
      matches.value = e.matches
    }
    mq.addEventListener('change', onChange)
    onScopeDispose(() => mq.removeEventListener('change', onChange))
  }
  return matches
}
