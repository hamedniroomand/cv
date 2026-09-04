import type { Experience } from '#shared/schemas/experience'
import type { AppCommand, AppContext, PickerItem } from '../types'
import { formatRange } from '#shared/cv/format'

function choices(ctx: AppContext): PickerItem[] {
  return [...ctx.cv.experience]
    .sort((a, b) => a.order - b.order)
    .map(exp => ({
      value: exp.slug,
      label: exp.company,
      description: exp.roles
        .map(role => `${role.title} · ${formatRange(role.start, role.end)}`)
        .join('; '),
      keywords: [exp.slug, ...exp.stack],
    }))
}

function resolveExperience(input: string, experiences: Experience[]): Experience | undefined {
  const query = input.toLocaleLowerCase()
  const exact = experiences.find(exp => exp.slug.toLocaleLowerCase() === query)
  if (exact)
    return exact
  const companyMatches = experiences.filter(exp => exp.company.toLocaleLowerCase().startsWith(query))
  return companyMatches.length === 1 ? companyMatches[0] : undefined
}

export default {
  name: 'experience',
  description: 'Browse roles and highlights',
  args: '[company]',
  complete: (_argv, ctx) => choices(ctx),
  async run(argv, ctx) {
    const requested = argv[0] ?? await ctx.view.pick('Choose a company', choices(ctx), {
      placeholder: 'Filter companies',
    })
    if (requested === null)
      return 130

    const experience = resolveExperience(requested, ctx.cv.experience)
    if (!experience) {
      ctx.view.print(
        `experience: unknown company '${requested}' (try: ${ctx.cv.experience.map(exp => exp.slug).join(', ')})`,
        'error',
      )
      return 1
    }

    const readme = ctx.fs.readFile(`~/experience/${experience.slug}/README.md`)
    const highlights = experience.highlights.map(
      highlight => `- ${highlight.title} — ${highlight.body}`,
    )
    ctx.view.print([
      readme,
      ...(highlights.length > 0 ? ['', 'Highlights', ...highlights] : []),
    ].join('\n'))
    ctx.panel.navigate({ section: 'experience', slug: experience.slug })
    return 0
  },
} satisfies AppCommand
