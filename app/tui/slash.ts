import type { AppCommand } from './types';

export interface SlashInput {
  name: string;
  argv: string[];
  partial: boolean;
}

export function parseSlashInput(line: string): SlashInput | null {
  if (!line.startsWith('/')) return null;

  const rest = line.slice(1);
  if (rest.length === 0) return { name: '', argv: [], partial: true };

  const spaceIndex = rest.indexOf(' ');
  if (spaceIndex === -1) return { name: rest, argv: [], partial: true };

  const name = rest.slice(0, spaceIndex);
  const argv = rest
    .slice(spaceIndex + 1)
    .split(/\s+/)
    .filter(Boolean);
  return { name, argv, partial: false };
}

export function slashOptionId(key: string): string {
  return `tui-slash-option-${key.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return i === needle.length;
}

function keyTier(query: string, key: string): number | null {
  if (key === query) return 0;
  if (key.startsWith(query)) return 1;
  if (isSubsequence(query, key)) return 2;
  return null;
}

function matchTier(query: string, command: AppCommand): number | null {
  const tiers = [command.name, ...(command.aliases ?? [])]
    .map(key => keyTier(query.toLowerCase(), key.toLowerCase()))
    .filter((tier): tier is number => tier !== null);
  return tiers.length > 0 ? Math.min(...tiers) : null;
}

export function filterCommands(query: string, commands: AppCommand[]): AppCommand[] {
  const tiers: AppCommand[][] = [[], [], []];
  for (const command of commands) {
    const tier = matchTier(query, command);
    if (tier !== null) tiers[tier]!.push(command);
  }
  for (const tier of tiers) tier.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return tiers.flat();
}
