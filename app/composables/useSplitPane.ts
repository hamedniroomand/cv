import { clampSplitRatio, parseSplitRatio, SPLIT_DEFAULT, SPLIT_PANEL_KEY, SPLIT_RATIO_KEY } from '#shared/split'

function applyRatio(value: number): void {
  document.documentElement.style.setProperty('--split', String(value))
}

function applyPanel(open: boolean): void {
  if (open)
    delete document.documentElement.dataset.panel
  else
    document.documentElement.dataset.panel = 'closed'
}

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
    ratio.value = clampSplitRatio(value)
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
