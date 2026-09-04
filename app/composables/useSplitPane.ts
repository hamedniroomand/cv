import { parseSplitRatio, SPLIT_DEFAULT, SPLIT_MAX, SPLIT_MIN, SPLIT_PANEL_KEY, SPLIT_RATIO_KEY } from '#shared/split'

export { SPLIT_DEFAULT, SPLIT_MAX, SPLIT_MIN }

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

/** Mirror the ratio onto <html> so CSS sees it; the pre-paint script in nuxt.config does the same before hydration. */
function applyRatio(value: number): void {
  document.documentElement.style.setProperty('--split', String(value))
}

function applyPanel(open: boolean): void {
  if (open)
    delete document.documentElement.dataset.panel
  else
    document.documentElement.dataset.panel = 'closed'
}

/**
 * Terminal/panel split ratio and panel visibility, persisted per browser.
 * The layout is driven by `--split` and `data-panel` on <html>, which the pre-paint script sets before the
 * first frame; state is synced after mount so hydration never moves the divider.
 */
export function useSplitPane() {
  const ratio = useState<number>('split-ratio', () => SPLIT_DEFAULT)
  const panelOpen = useState<boolean>('split-panel-open', () => true)

  if (import.meta.client) {
    onMounted(() => {
      const stored = parseSplitRatio(readStorage(SPLIT_RATIO_KEY))
      if (stored !== null)
        ratio.value = stored
      if (readStorage(SPLIT_PANEL_KEY) === 'closed')
        panelOpen.value = false
    })
  }

  function setRatio(value: number): void {
    ratio.value = Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, value))
    applyRatio(ratio.value)
    writeStorage(SPLIT_RATIO_KEY, ratio.value.toFixed(3))
  }

  function toggle(): void {
    panelOpen.value = !panelOpen.value
    applyPanel(panelOpen.value)
    writeStorage(SPLIT_PANEL_KEY, panelOpen.value ? 'open' : 'closed')
  }

  return { ratio: readonly(ratio), panelOpen: readonly(panelOpen), setRatio, toggle }
}
