import type { Experience } from '#shared/schemas/experience';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PRESENT = 'present';
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.4375;

export function formatYearMonth(yearMonth: string): string {
  if (yearMonth === PRESENT) return 'Present';
  const [year, month] = yearMonth.split('-');
  return `${MONTHS[Number(month) - 1] ?? month} ${year}`;
}

export function formatRange(start: string, end: string): string {
  return `${formatYearMonth(start)} – ${formatYearMonth(end)}`;
}

function toTime(yearMonth: string, now: Date): number {
  if (yearMonth === PRESENT) return now.getTime();
  const [year, month] = yearMonth.split('-').map(Number);
  return Date.UTC(year!, month! - 1, 1);
}

export function totalYears(
  experience: readonly Pick<Experience, 'roles'>[],
  now = new Date(),
): number {
  const roles = experience.flatMap(entry => entry.roles);
  if (roles.length === 0) return 0;
  const start = Math.min(...roles.map(role => toTime(role.start, now)));
  const end = Math.max(...roles.map(role => toTime(role.end, now)));
  return Math.floor((end - start) / MS_PER_MONTH / 12);
}
