import { formatRange } from '#shared/cv/format';
import { wrapText } from '~/terminal/io/text';
import type { Command, CommandContext, Writer } from '~/terminal/types';

import { visibleCommands } from './_util';

const INDENT = '       ';
const OPTION_INDENT = '              ';

function section(out: Writer, title: string, lines: string[]): void {
  out.line(title);
  for (const line of lines) out.line(`${INDENT}${line}`);
  out.line();
}

function manHamed(ctx: CommandContext): void {
  const { profile, skills, experience } = ctx.cv;
  const out = ctx.stdout;
  const latest = experience[0];
  const role = latest?.roles[0];
  const description = wrapText(profile.summary, 66);
  if (latest && role)
    description.push(
      '',
      `Currently: ${role.title} at ${latest.company} (${formatRange(role.start, role.end)}).`,
    );

  out.line('HAMED(1)                       User Commands                       HAMED(1)', 'dim');
  out.line();
  section(out, 'NAME', [`hamed - ${profile.title}`]);
  section(out, 'SYNOPSIS', [
    `hamed [--${skills.categories.map(category => category.id).join('] [--')}]`,
  ]);
  section(out, 'DESCRIPTION', description);
  out.line('OPTIONS');
  for (const category of skills.categories) {
    out.line(`${INDENT}--${category.id}`);
    for (const line of wrapText(category.items.map(item => item.name).join(', '), 60))
      out.line(`${OPTION_INDENT}${line}`);
  }
  out.line();
  out.line('SEE ALSO');
  out.line(`${INDENT}whoami(1), cv(1), skills(1), contact(1)`);
}

function manCommand(ctx: CommandContext, command: Command): void {
  ctx.stdout.line(`${command.name.toUpperCase()}(1)`, 'dim');
  ctx.stdout.line();
  section(ctx.stdout, 'NAME', [`${command.name} - ${command.description}`]);
  ctx.stdout.line('SYNOPSIS');
  ctx.stdout.line(`${INDENT}${command.usage}`);
}

export default {
  name: 'man',
  description: 'Show a manual page',
  usage: 'man <page>',
  complete: (_argv, ctx) => ['hamed', ...visibleCommands(ctx)],
  run(argv, ctx) {
    const page = argv[0];
    if (!page) {
      ctx.stderr.line('What manual page do you want?');
      return 1;
    }
    if (page === 'hamed') {
      manHamed(ctx);
      return 0;
    }
    const command = ctx.registry.get(page);
    if (!command) {
      ctx.stderr.line(`No manual entry for ${page}`);
      return 1;
    }
    manCommand(ctx, command);
    return 0;
  },
} satisfies Command;
