import type { Command, CommandContext } from '~/terminal/types';

import { visibleCommands } from './_util';

function describe(ctx: CommandContext, name: string): number {
  const command = ctx.registry.get(name);
  if (!command) {
    ctx.stderr.line(`help: no such command: ${name}`);
    return 1;
  }
  ctx.stdout.line(command.description);
  ctx.stdout.line(`usage: ${command.usage}`);
  return 0;
}

function listAll(ctx: CommandContext): number {
  const visible = ctx.registry.list().filter(command => !command.hidden);
  const width = Math.max(10, ...visible.map(command => command.name.length + 2));
  for (const command of visible) {
    ctx.stdout.write(command.name.padEnd(width), 'accent');
    ctx.stdout.line(command.description);
  }
  ctx.stdout.line();
  ctx.stdout.line(
    'Tab completes, ↑/↓ recall history, | pipes. Try: cat about.md | grep lead',
    'dim',
  );
  return 0;
}

export default {
  name: 'help',
  aliases: ['?'],
  description: 'List available commands',
  usage: 'help [command]',
  complete: (_argv, ctx) => visibleCommands(ctx),
  run(argv, ctx) {
    const name = argv[0];
    return name ? describe(ctx, name) : listAll(ctx);
  },
} satisfies Command;
