import type { Project } from '#shared/schemas/project'
import type { AppCommand, AppContext, PickerItem } from '../types'
import { githubUrl } from '#shared/cv/links'
import { unknownValueMessage } from '~/terminal/messages'
import { chooseValue } from '../choose'
import { printMarkdown } from '../markdown'
import { EXIT_CANCELLED } from '../types'

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

function printLink(ctx: AppContext, label: string, href: string): void {
  ctx.view.print([{ text: `${label}: ` }, { text: href, style: 'accent', href }])
}

export default {
  name: 'projects',
  description: 'Browse projects and links',
  args: '[name]',
  complete: (_argv, ctx) => choices(ctx),
  async run(argv, ctx) {
    const requested = await chooseValue(argv, ctx, 'Choose a project', choices(ctx), { placeholder: 'Filter projects' })
    if (requested === null)
      return EXIT_CANCELLED

    const project = resolveProject(requested, ctx.cv.projects)
    if (!project) {
      const slugs = ctx.cv.projects.map(item => item.slug)
      ctx.view.print(unknownValueMessage('projects', 'project', requested, slugs), 'error')
      return 1
    }

    printMarkdown(ctx.view, ctx.fs.readFile(`~/projects/${project.slug}/README.md`))
    printLink(ctx, 'Repository', githubUrl(project.repo))
    if (project.docs)
      printLink(ctx, 'Docs', project.docs)
    ctx.panel.navigate({ section: 'projects', slug: project.slug })
    return 0
  },
} satisfies AppCommand
