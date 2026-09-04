import type { AppCommand, PickerItem } from '../types'
import { THEMES } from '~/composables/useTheme'

const choices: PickerItem[] = THEMES.map(theme => ({
  value: theme,
  label: theme,
}))

export default {
  name: 'theme',
  description: 'Choose the colour theme',
  args: '[name]',
  complete: () => choices,
  async run(argv, ctx) {
    const selected = argv[0] ?? await ctx.view.pick('Choose a theme', choices, {
      initial: ctx.env.theme,
      placeholder: 'Filter themes',
    })
    if (selected === null)
      return 130

    return ctx.shell(`theme ${selected}`)
  },
} satisfies AppCommand
