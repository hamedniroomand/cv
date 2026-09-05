import { unknownValueMessage } from '~/terminal/messages';
import { chooseValue } from '~/tui/choose';
import { openInPanel } from '~/tui/panel';
import type { AppCommand, AppContext, PickerItem } from '~/tui/types';
import { EXIT_CANCELLED } from '~/tui/types';

const ALL = 'all';

function choices(ctx: AppContext): PickerItem[] {
  return [
    { value: ALL, label: 'All skills', description: 'Show every category', keywords: [ALL] },
    ...ctx.cv.skills.categories.map(category => ({
      value: category.id,
      label: category.label,
      description: category.items.map(item => item.name).join(', '),
      keywords: [category.id, ...category.items.map(item => item.name)],
    })),
  ];
}

export default {
  name: 'skills',
  description: 'Browse skills by category',
  args: '[category]',
  complete: (_argv, ctx) => choices(ctx),
  async run(argv, ctx) {
    const requested = await chooseValue(argv, ctx, 'Choose a skill category', choices(ctx), {
      placeholder: 'Filter skill categories',
    });
    if (requested === null) return EXIT_CANCELLED;

    const query = requested.toLocaleLowerCase();
    if (query === ALL) {
      openInPanel(ctx, 'Skills', { section: 'skills' }, 'skills');
      return 0;
    }

    const { categories } = ctx.cv.skills;
    const category = categories.find(item => item.id.toLocaleLowerCase() === query);
    if (!category) {
      ctx.view.print(
        unknownValueMessage('skills', 'category', requested, [
          ALL,
          ...categories.map(item => item.id),
        ]),
        'error',
      );
      return 1;
    }
    openInPanel(ctx, category.label, { section: 'skills' }, `skills --category ${category.id}`);
    return 0;
  },
} satisfies AppCommand;
