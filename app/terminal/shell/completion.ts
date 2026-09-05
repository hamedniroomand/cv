import type { CompletionContext } from '~/terminal/types';

export interface CompletionResult {
  line: string;
  candidates: string[];
}

function words(text: string): string[] {
  const parts = text.split(/\s+/).filter(Boolean);
  if (text.length === 0 || /\s$/.test(text)) parts.push('');
  return parts;
}

function longestCommonPrefix(items: string[]): string {
  if (items.length === 0) return '';
  let prefix = items[0]!;
  for (const item of items.slice(1)) {
    while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

function commandCandidates(ctx: CompletionContext, current: string): string[] {
  return ctx.registry
    .list()
    .filter(command => !command.hidden)
    .map(command => command.name)
    .filter(name => name.startsWith(current));
}

function argumentCandidates(
  ctx: CompletionContext,
  argv: string[],
  current: string,
): string[] | null {
  const command = ctx.registry.get(argv[0]!);
  if (!command) return null;
  if (!command.complete) return ctx.fs.complete(current);
  return command.complete(argv.slice(1), ctx).filter(candidate => candidate.startsWith(current));
}

function suffixFor(candidate: string, isCommand: boolean): string {
  if (isCommand) return ' ';
  return candidate.endsWith('/') ? '' : ' ';
}

export function completeLine(line: string, ctx: CompletionContext): CompletionResult {
  const pipeIndex = line.lastIndexOf('|');
  const head = pipeIndex >= 0 ? line.slice(0, pipeIndex + 1) : '';
  const segment = pipeIndex >= 0 ? line.slice(pipeIndex + 1) : line;
  const argv = words(segment);
  const current = argv[argv.length - 1] ?? '';
  const before = segment.slice(0, segment.length - current.length);
  const isCommand = argv.length <= 1;

  const found = isCommand
    ? commandCandidates(ctx, current)
    : argumentCandidates(ctx, argv, current);
  if (found === null) return { line, candidates: [] };
  const candidates = [...new Set(found)].sort();

  if (candidates.length === 1) {
    const only = candidates[0]!;
    return { line: `${head}${before}${only}${suffixFor(only, isCommand)}`, candidates };
  }
  if (candidates.length > 1) {
    const common = longestCommonPrefix(candidates);
    if (common.length > current.length) return { line: `${head}${before}${common}`, candidates };
  }
  return { line, candidates };
}
