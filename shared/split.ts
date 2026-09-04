export const SPLIT_MIN = 0.3
export const SPLIT_MAX = 0.8
export const SPLIT_DEFAULT = 0.55
export const SPLIT_RATIO_KEY = 'cv:split'
export const SPLIT_PANEL_KEY = 'cv:panel'

export function clampSplitRatio(value: number): number {
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, value))
}

export function parseSplitRatio(raw: string | null): number | null {
  if (raw === null || raw.trim() === '')
    return null
  const value = Number(raw)
  return Number.isFinite(value) && value >= SPLIT_MIN && value <= SPLIT_MAX ? value : null
}
