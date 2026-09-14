import type { AppCommand } from '~/tui/types';

function usage(command: AppCommand): string {
  return `/${command.name}${command.args ? ` ${command.args}` : ''}`;
}

export default {
  name: 'help',
  description: 'List app commands and controls',
  run(_argv, ctx) {
    const commands = ctx.registry.list();
    const width = Math.max(...commands.map(command => usage(command).length));
    for (const command of commands) {
      ctx.view.print(`${usage(command).padEnd(width)}  ${command.description}`);
    }
    ctx.view.print('Plain text runs as a shell command.');
    ctx.view.print('Press Esc on an empty prompt to leave the app.');
    return 0;
  },
} satisfies AppCommand;
