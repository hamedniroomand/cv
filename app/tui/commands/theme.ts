import type { AppCommand, PickerItem } from '../types'
import { THEMES } from '#shared/theme'
import { chooseValue } from '../choose'
import { EXIT_CANCELLED } from '../types'

const choices: PickerItem[] = THEMES.map(theme => ({ value: theme, label: theme }))

export default {
  name: 'theme',
  description: 'Choose the colour theme',
  args: '[name]',
  complete: () => choices,
  async run(argv, ctx) {
    const selected = await chooseValue(argv, ctx, 'Choose a theme', choices, {
      initial: ctx.env.theme,
      placeholder: 'Filter themes',
    })
    if (selected === null)
      return EXIT_CANCELLED
    return ctx.shell(`theme ${selected}`)
  },
} satisfies AppCommand
