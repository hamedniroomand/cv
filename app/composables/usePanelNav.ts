import type { PanelTarget } from '#shared/cv/panel-target'
import { panelTargetId } from '#shared/cv/panel-target'

const HIGHLIGHT_MS = 1200

/** Scroll the resume panel to a target and briefly highlight it. Shared between terminal and panel. */
export function usePanelNav() {
  const active = useState<string | null>('panel-active', () => null)
  const reduced = useReducedMotion()
  let timer: ReturnType<typeof setTimeout> | undefined

  function navigate(target: PanelTarget): void {
    if (!import.meta.client)
      return
    const id = panelTargetId(target)
    const el = document.getElementById(id)
    if (!el)
      return
    el.scrollIntoView({ block: 'start', behavior: reduced.value ? 'auto' : 'smooth' })
    active.value = id
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (active.value === id)
        active.value = null
    }, HIGHLIGHT_MS)
  }

  return { navigate, active: readonly(active) }
}
