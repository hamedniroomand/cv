export const HISTORY_STORAGE_KEY = 'cv:history';

/** Parses a stored history list. Keeps only the last `limit` non-empty strings. */
export function parseHistory(raw: string | null, limit: number): string[] {
  if (raw === null || limit <= 0) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((line): line is string => typeof line === 'string' && line.trim() !== '')
    .slice(-limit);
}
