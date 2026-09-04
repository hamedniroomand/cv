import type { SkillCategory } from '#shared/schemas/skills'
import type { Command, CommandContext } from '../types'
import { unknownValueMessage } from '../messages'
import { parseFlags } from '../shell/flags'

function itemLabel(item: SkillCategory['items'][number]): string {
  return item.note ? `${item.name} (${item.note})` : item.name
}

function printCategory(ctx: CommandContext, category: SkillCategory): void {
  ctx.stdout.line(category.label, 'accent')
  ctx.stdout.line(`  ${category.items.map(itemLabel).join(', ')}`)
}

export default {
  name: 'skills',
  description: 'List skills by category',
  usage: 'skills [--category <id>]',
  complete(argv, ctx) {
    return argv.includes('--category') ? ctx.cv.skills.categories.map(category => category.id) : ['--category']
  },
  run(argv, ctx) {
    const { values } = parseFlags(argv, { string: ['category'] })
    const { categories } = ctx.cv.skills
    const wanted = values.category
    const shown = wanted ? categories.filter(category => category.id === wanted) : categories
    if (wanted && shown.length === 0) {
      ctx.stderr.line(unknownValueMessage('skills', 'category', wanted, categories.map(category => category.id)))
      return 1
    }
    for (const category of shown)
      printCategory(ctx, category)
    ctx.panel.navigate({ section: 'skills' })
    return 0
  },
} satisfies Command
