import type { Command } from '../types'
import { parseFlags } from '../shell/flags'

export default {
  name: 'skills',
  description: 'List skills by category',
  usage: 'skills [--category <id>]',
  complete(argv, ctx) {
    return argv.includes('--category') ? ctx.cv.skills.categories.map(c => c.id) : ['--category']
  },
  run(argv, ctx) {
    const { values } = parseFlags(argv, { string: ['category'] })
    const { categories } = ctx.cv.skills
    const wanted = values.category
    const shown = wanted ? categories.filter(c => c.id === wanted) : categories
    if (wanted && shown.length === 0) {
      ctx.stderr.line(`skills: unknown category '${wanted}' (try: ${categories.map(c => c.id).join(', ')})`)
      return 1
    }
    for (const cat of shown) {
      ctx.stdout.line(cat.label, 'accent')
      ctx.stdout.line(`  ${cat.items.map(i => (i.note ? `${i.name} (${i.note})` : i.name)).join(', ')}`)
    }
    ctx.panel.navigate({ section: 'skills' })
    return 0
  },
} satisfies Command
