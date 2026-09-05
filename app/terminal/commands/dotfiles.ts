import { stripScheme } from '#shared/cv/links';
import { dotfilePath } from '#shared/cv/panel-target';
import type { Dotfile } from '#shared/schemas/dotfile';
import type { Command, CommandContext } from '~/terminal/types';

import { writeLink } from './_util';

function printDotfile(ctx: CommandContext, dotfile: Dotfile): void {
  const url = `${ctx.env.siteUrl}${dotfilePath(dotfile.slug)}`;
  ctx.stdout.line(dotfile.title, 'accent');
  ctx.stdout.line(`  ${dotfile.path}`, 'dim');
  writeLink(ctx.stdout, '  ', stripScheme(url), url);
}

export default {
  name: 'dotfiles',
  description: 'List published config files',
  usage: 'dotfiles',
  run(_argv, ctx) {
    const { dotfiles } = ctx.cv;
    if (dotfiles.length === 0) {
      ctx.stdout.line('No dotfiles published yet.');
      return 0;
    }
    for (const dotfile of dotfiles) printDotfile(ctx, dotfile);
    ctx.panel.navigate({ section: 'dotfiles' });
    return 0;
  },
} satisfies Command;
