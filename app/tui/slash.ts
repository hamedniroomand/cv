import type { AppCommand } from './types'

export interface SlashInput {
  name: string
  argv: string[]
  partial: boolean
}

/** Parse a prompt line when slash is the first character; otherwise null. */
export function parseSlashInput(line: string): SlashInput | null {
  if (!line.startsWith('/'))
    return null

  const rest = line.slice(1)
  if (rest.length === 0)
    return { name: '', argv: [], partial: true }

  const spaceIndex = rest.indexOf(' ')
  if (spaceIndex === -1)
    return { name: rest, argv: [], partial: true }

  const name = rest.slice(0, spaceIndex)
  const argPart = rest.slice(spaceIndex + 1)
  const argv = argPart.length === 0 ? [] : argPart.split(/\s+/).filter(Boolean)
  return { name, argv, partial: false }
}

function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0
  for (const ch of haystack) {
    if (ch === needle[i])
      i++
    if (i === needle.length)
      return true
  }
  return i === needle.length
}

function matchTier(query: string, command: AppCommand): number | null {
  const q = query.toLowerCase()
  const keys = [command.name, ...(command.aliases ?? [])]
  let best: number | null = null
  for (const key of keys) {
    const k = key.toLowerCase()
    if (k === q)
      best = best === null ? 0 : Math.min(best, 0)
    else if (k.startsWith(q))
      best = best === null ? 1 : Math.min(best, 1)
    else if (isSubsequence(q, k))
      best = best === null ? 2 : Math.min(best, 2)
  }
  return best
}

/** Rank commands for the slash menu: exact, prefix, then subsequence; stable by name within each tier. */
export function filterCommands(query: string, commands: AppCommand[]): AppCommand[] {
  const tiers: AppCommand[][] = [[], [], []]
  for (const command of commands) {
    const tier = matchTier(query, command)
    if (tier !== null)
      tiers[tier]!.push(command)
  }
  for (const tier of tiers)
    tier.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  return tiers.flat()
}
