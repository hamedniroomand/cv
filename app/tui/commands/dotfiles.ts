import type { Dotfile } from '#shared/schemas/dotfile';
import { unknownValueMessage } from '~/terminal/messages';
import { chooseValue } from '~/tui/choose';
import { openInPanel } from '~/tui/panel';
import type { AppCommand, AppContext, PickerItem } from '~/tui/types';
import { EXIT_CANCELLED } from '~/tui/types';

function choices(ctx: AppContext): PickerItem[] {
  return ctx.cv.dotfiles.map(dotfile => ({
    value: dotfile.slug,
    label: dotfile.title,
    description: dotfile.path,
    keywords: [dotfile.slug, dotfile.lang],
  }));
}

function resolveDotfile(input: string, dotfiles: Dotfile[]): Dotfile | undefined {
  const query = input.toLocaleLowerCase();
  return dotfiles.find(dotfile => dotfile.slug.toLocaleLowerCase() === query);
}

export default {
  name: 'dotfiles',
  description: 'Open a config file',
  args: '[name]',
  complete: (_argv, ctx) => choices(ctx),
  async run(argv, ctx) {
    if (ctx.cv.dotfiles.length === 0) {
      ctx.view.print('No dotfiles published yet.');
      return 0;
    }
    const requested = await chooseValue(argv, ctx, 'Choose a config file', choices(ctx), {
      placeholder: 'Filter config files',
    });
    if (requested === null) return EXIT_CANCELLED;

    const dotfile = resolveDotfile(requested, ctx.cv.dotfiles);
    if (!dotfile) {
      const slugs = ctx.cv.dotfiles.map(item => item.slug);
      ctx.view.print(unknownValueMessage('dotfiles', 'dotfile', requested, slugs), 'error');
      return 1;
    }

    openInPanel(
      ctx,
      dotfile.title,
      { section: 'dotfiles', slug: dotfile.slug },
      `cat ${dotfile.path}`,
    );
    return 0;
  },
} satisfies AppCommand;
