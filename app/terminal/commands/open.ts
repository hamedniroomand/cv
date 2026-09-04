import type { Command, CommandContext } from '../types'
import { githubUrl, mailtoUrl } from '#shared/cv/links'

export const PDF_FILENAME = 'hamed-niroomand-cv.pdf'
export const PDF_PATH = `/${PDF_FILENAME}`

const TARGETS = ['github', 'linkedin', 'email', 'cue', 'pdf'] as const

function urlFor(target: string, ctx: CommandContext): string | null {
  const { links } = ctx.cv.profile
  switch (target) {
    case 'github': return githubUrl(links.github)
    case 'linkedin': return links.linkedin
    case 'email': return mailtoUrl(links.email)
    case 'cue': {
      const project = ctx.cv.projects.find(item => item.slug === 'cue') ?? ctx.cv.projects[0]
      return project ? githubUrl(project.repo) : null
    }
    default: return /^https?:\/\//.test(target) ? target : null
  }
}

export default {
  name: 'open',
  description: 'Open a link in a new tab',
  usage: `open <${TARGETS.join('|')}|url>`,
  complete: () => [...TARGETS],
  run(argv, ctx) {
    const target = argv[0]
    if (target === 'pdf') {
      ctx.ui.download(PDF_PATH, PDF_FILENAME)
      return 0
    }
    const url = target ? urlFor(target, ctx) : null
    if (!url) {
      ctx.stderr.line(`open: unknown target${target ? ` '${target}'` : ''}. Try one of: ${TARGETS.join(', ')}, or a URL.`)
      return 1
    }
    ctx.stdout.write('Opening ')
    ctx.stdout.link(url, url)
    ctx.stdout.line()
    ctx.ui.openUrl(url)
    return 0
  },
} satisfies Command
