import type { AppCommand, AppContext, PickerItem } from '../types'

function choices(ctx: AppContext): PickerItem[] {
  return [
    {
      value: 'all',
      label: 'All skills',
      description: 'Show every category',
      keywords: ['all'],
    },
    ...ctx.cv.skills.categories.map(category => ({
      value: category.id,
      label: category.label,
      description: category.items.map(item => item.name).join(', '),
      keywords: [category.id, ...category.items.map(item => item.name)],
    })),
  ]
}

export default {
  name: 'skills',
  description: 'Browse skills by category',
  args: '[category]',
  complete: (_argv, ctx) => choices(ctx),
  async run(argv, ctx) {
    const requested = argv[0] ?? await ctx.view.pick('Choose a skill category', choices(ctx), {
      placeholder: 'Filter skill categories',
    })
    if (requested === null)
      return 130

    if (requested.toLocaleLowerCase() === 'all')
      return ctx.shell('skills')

    const category = ctx.cv.skills.categories.find(
      item => item.id.toLocaleLowerCase() === requested.toLocaleLowerCase(),
    )
    if (!category) {
      ctx.view.print(
        `skills: unknown category '${requested}' (try: all, ${ctx.cv.skills.categories.map(item => item.id).join(', ')})`,
        'error',
      )
      return 1
    }
    return ctx.shell(`skills --category ${category.id}`)
  },
} satisfies AppCommand
