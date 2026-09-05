import type { AppCommand } from '~/tui/types';

export default {
  name: 'help',
  description: 'List app commands and controls',
  run(_argv, ctx) {
    const commands = ctx.registry.list();
    const usages = commands.map(
      command => `/${command.name}${command.args ? ` ${command.args}` : ''}`,
    );
    const width = Math.max(...usages.map(usage => usage.length));
    commands.forEach((command, index) => {
      ctx.view.print(`${usages[index]!.padEnd(width)}  ${command.description}`);
    });
    ctx.view.print('Plain text runs as a shell command.');
    ctx.view.print('Press Esc on an empty prompt to leave the app.');
    return 0;
  },
} satisfies AppCommand;
