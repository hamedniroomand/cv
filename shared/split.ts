/** Terminal/resume split: constants shared by the pre-paint script, the composable and the pane. */
export const SPLIT_MIN = 0.3
export const SPLIT_MAX = 0.8
export const SPLIT_DEFAULT = 0.55
export const SPLIT_RATIO_KEY = 'cv:split'
export const SPLIT_PANEL_KEY = 'cv:panel'

/** A stored ratio, or null when it is missing, corrupt or outside the allowed range. */
export function parseSplitRatio(raw: string | null): number | null {
  if (raw === null || raw.trim() === '')
    return null
  const value = Number(raw)
  return Number.isFinite(value) && value >= SPLIT_MIN && value <= SPLIT_MAX ? value : null
}
