import type { Project } from '#shared/schemas/project'
import type { AppCommand, AppContext, PickerItem } from '../types'
import { printMarkdown } from '../markdown'

function choices(ctx: AppContext): PickerItem[] {
  return ctx.cv.projects.map(project => ({
    value: project.slug,
    label: project.name,
    description: project.tagline,
    keywords: [project.slug, ...project.stack],
  }))
}

function resolveProject(input: string, projects: Project[]): Project | undefined {
  const query = input.toLocaleLowerCase()
  return projects.find(project => project.slug.toLocaleLowerCase() === query)
}

export default {
  name: 'projects',
  description: 'Browse projects and links',
  args: '[name]',
  complete: (_argv, ctx) => choices(ctx),
  async run(argv, ctx) {
    const requested = argv[0] ?? await ctx.view.pick('Choose a project', choices(ctx), {
      placeholder: 'Filter projects',
    })
    if (requested === null)
      return 130

    const project = resolveProject(requested, ctx.cv.projects)
    if (!project) {
      ctx.view.print(
        `projects: unknown project '${requested}' (try: ${ctx.cv.projects.map(item => item.slug).join(', ')})`,
        'error',
      )
      return 1
    }

    const repository = `https://github.com/${project.repo}`
    printMarkdown(ctx.view, ctx.fs.readFile(`~/projects/${project.slug}/README.md`))
    ctx.view.print([
      { text: 'Repository: ' },
      { text: repository, style: 'accent', href: repository },
    ])
    if (project.docs) {
      ctx.view.print([
        { text: 'Docs: ' },
        { text: project.docs, style: 'accent', href: project.docs },
      ])
    }
    ctx.panel.navigate({ section: 'projects', slug: project.slug })
    return 0
  },
} satisfies AppCommand
