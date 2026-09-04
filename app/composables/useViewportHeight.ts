import type { Ref } from 'vue'

export function useViewportHeight(root: Ref<HTMLElement | null>, onChange: () => void) {
  const height = ref<string>()
  let observer: ResizeObserver | null = null

  function sync(): void {
    const viewport = window.visualViewport
    if (!viewport || !root.value)
      return
    const rect = root.value.getBoundingClientRect()
    if (rect.height === 0)
      return
    const next = `${Math.max(0, viewport.height - rect.top)}px`
    if (next === height.value)
      return
    height.value = next
    onChange()
  }

  onMounted(() => {
    if (!window.visualViewport)
      return
    window.visualViewport.addEventListener('resize', sync)
    if ('ResizeObserver' in window && root.value) {
      observer = new ResizeObserver(sync)
      observer.observe(root.value)
    }
    sync()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    window.visualViewport?.removeEventListener('resize', sync)
  })

  return { height }
}
