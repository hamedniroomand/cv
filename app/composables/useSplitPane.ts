const RATIO_KEY = 'cv:split'
const PANEL_KEY = 'cv:panel'
export const SPLIT_MIN = 0.3
export const SPLIT_MAX = 0.8
export const SPLIT_DEFAULT = 0.55

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  }
  catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  }
  catch {
    // Storage unavailable; the in-memory value still applies for this visit.
  }
}

/** Terminal/panel split ratio and panel visibility, persisted per browser. */
export function useSplitPane() {
  const ratio = useState<number>('split-ratio', () => SPLIT_DEFAULT)
  const panelOpen = useState<boolean>('split-panel-open', () => true)

  if (import.meta.client) {
    onMounted(() => {
      const stored = Number(readStorage(RATIO_KEY))
      if (stored >= SPLIT_MIN && stored <= SPLIT_MAX)
        ratio.value = stored
      if (readStorage(PANEL_KEY) === 'closed')
        panelOpen.value = false
    })
  }

  function setRatio(value: number): void {
    ratio.value = Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, value))
    writeStorage(RATIO_KEY, ratio.value.toFixed(3))
  }

  function toggle(): void {
    panelOpen.value = !panelOpen.value
    writeStorage(PANEL_KEY, panelOpen.value ? 'open' : 'closed')
  }

  return { ratio: readonly(ratio), panelOpen: readonly(panelOpen), setRatio, toggle }
}
