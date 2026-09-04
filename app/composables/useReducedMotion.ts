/** True when the OS asks for reduced motion. Always false during SSR. */
export function useReducedMotion() {
  const reduced = ref(false)
  if (import.meta.client) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches
    const onChange = (e: MediaQueryListEvent) => {
      reduced.value = e.matches
    }
    mq.addEventListener('change', onChange)
    onScopeDispose(() => mq.removeEventListener('change', onChange))
  }
  return reduced
}
