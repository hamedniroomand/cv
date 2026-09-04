import type { Experience } from '../schemas/experience'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2022-09' → 'Sep 2022', 'present' → 'Present'. Deterministic across runtimes. */
export function formatYearMonth(ym: string): string {
  if (ym === 'present')
    return 'Present'
  const [year, month] = ym.split('-')
  const idx = Number(month) - 1
  return `${MONTHS[idx] ?? month} ${year}`
}

export function formatRange(start: string, end: string): string {
  return `${formatYearMonth(start)} – ${formatYearMonth(end)}`
}

function toDate(ym: string, now: Date): Date {
  if (ym === 'present')
    return now
  const [year, month] = ym.split('-').map(Number)
  return new Date(Date.UTC(year!, month! - 1, 1))
}

/** Whole years between the earliest role start and the latest role end. */
export function totalYears(experience: readonly Pick<Experience, 'roles'>[], now = new Date()): number {
  const roles = experience.flatMap(e => e.roles)
  if (roles.length === 0)
    return 0
  const start = Math.min(...roles.map(r => toDate(r.start, now).getTime()))
  const end = Math.max(...roles.map(r => toDate(r.end, now).getTime()))
  const months = (end - start) / (1000 * 60 * 60 * 24 * 30.4375)
  return Math.floor(months / 12)
}
