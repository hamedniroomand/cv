import type { Command, CommandContext } from '../types'

export const PDF_PATH = '/hamed-niroomand-cv.pdf'

const TARGETS = ['github', 'linkedin', 'email', 'cue', 'pdf'] as const

function urlFor(target: string, ctx: CommandContext): string | null {
  const { links } = ctx.cv.profile
  switch (target) {
    case 'github': return `https://github.com/${links.github}`
    case 'linkedin': return links.linkedin
    case 'email': return `mailto:${links.email}`
    case 'cue': {
      const cue = ctx.cv.projects.find(p => p.slug === 'cue') ?? ctx.cv.projects[0]
      return cue ? `https://github.com/${cue.repo}` : null
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
      ctx.ui.download(PDF_PATH, 'hamed-niroomand-cv.pdf')
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
