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

function infoLines(ctx: CommandContext): Span[][] {
  const skillCount = ctx.cv.skills.categories.reduce(
    (count, category) => count + category.items.length,
    0,
  );
  const lines = [
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
  ];
  return [...lines.map(text => [{ text }]), COLOUR_STYLES.map(style => ({ text: '█', style }))];
}

export default {
  name: 'neofetch',
  description: 'Display system and resume information',
  usage: 'neofetch',
  run(_argv, ctx) {
    const info = infoLines(ctx);
    const lineCount = Math.max(portrait.length, info.length);
    for (let i = 0; i < lineCount; i++) {
      const art = (portrait[i] ?? '').padEnd(ART_WIDTH);
      ctx.stdout.raw([{ text: `${art}${ART_GAP}`, style: 'pre' }, ...(info[i] ?? [])]);
      ctx.stdout.line();
    }
    return 0;
  },
} satisfies Command;
