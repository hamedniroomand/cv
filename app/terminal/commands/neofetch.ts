import { totalYears } from '#shared/cv/format';
import { portrait } from '~/terminal/art/portrait';
import type { Command, CommandContext, LineStyle, Span } from '~/terminal/types';

const ART_GAP = '    ';
const ART_WIDTH = Math.max(...portrait.map(line => line.length));
const COLOUR_STYLES: LineStyle[] = [
  'dim',
  'error',
  'success',
  'accent',
  'plain',
  'prompt',
  'accent',
  'plain',
];

type InfoLine = string | Span[];

function colourBlocks(): Span[] {
  return COLOUR_STYLES.map(style => ({ text: '█', style }));
}

function infoLines(ctx: CommandContext): InfoLine[] {
  const skillCount = ctx.cv.skills.categories.reduce(
    (count, category) => count + category.items.length,
    0,
  );
  return [
    `${ctx.env.user}@${ctx.env.host}`,
    '-----------------',
    'OS:       hamed.sh 1.0 (Nuxt 5 / Bun)',
    `Host:     ${ctx.env.host}`,
    'Kernel:   TypeScript 5',
    `Uptime:   ${totalYears(ctx.cv.experience)} years in production`,
    `Packages: ${skillCount} (skills.json)`,
    'Shell:    hamed-sh',
    `Theme:    ${ctx.env.theme}`,
    'Terminal: en_US',
    colourBlocks(),
  ];
}

function writeInfo(ctx: CommandContext, details: InfoLine | undefined): void {
  if (typeof details === 'string') ctx.stdout.write(details);
  else if (details) ctx.stdout.raw(details);
}

export default {
  name: 'neofetch',
  description: 'Display system and resume information',
  usage: 'neofetch',
  run(_argv, ctx) {
    const info = infoLines(ctx);
    const lineCount = Math.max(portrait.length, info.length);
    for (let i = 0; i < lineCount; i++) {
      const art = portrait[i] ?? '';
      ctx.stdout.raw([{ text: `${art.padEnd(ART_WIDTH)}${ART_GAP}`, style: 'pre' }]);
      writeInfo(ctx, info[i]);
      ctx.stdout.line();
    }
    return 0;
  },
} satisfies Command;
