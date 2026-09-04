import type { Command, CommandContext } from '~/terminal/types'
import { formatRange, totalYears } from '#shared/cv/format'
import { parseFlags } from '~/terminal/shell/flags'
import { PDF_FILENAME, PDF_PATH } from './open'

function printSummary(ctx: CommandContext): void {
  const { profile, experience, skills } = ctx.cv
  const latest = experience[0]
  const role = latest?.roles[0]
  ctx.stdout.line(profile.name, 'accent')
  ctx.stdout.line(profile.title)
  if (latest && role)
    ctx.stdout.line(`${role.title} @ ${latest.company} · ${formatRange(role.start, role.end)}`)
  ctx.stdout.line(`${totalYears(experience)} years in production · ${experience.length} companies`)
  const top = skills.categories.slice(0, 3).flatMap(category => category.items.slice(0, 3).map(item => item.name))
  ctx.stdout.line(`Skills: ${top.join(', ')}`)
  ctx.stdout.line()
  ctx.stdout.line('cv --pdf downloads the one-page PDF · cv --json dumps the data', 'dim')
}

export default {
  name: 'cv',
  aliases: ['resume'],
  description: 'Resume summary; --pdf downloads it',
  usage: 'cv [--pdf] [--json]',
  complete: () => ['--pdf', '--json'],
  run(argv, ctx) {
    const { flags } = parseFlags(argv, { boolean: ['pdf', 'json'] })
    if (flags.has('pdf')) {
      ctx.ui.download(PDF_PATH, PDF_FILENAME)
      ctx.stdout.line(`Downloading ${PDF_FILENAME}…`)
      return 0
    }
    if (flags.has('json')) {
      const { secrets: _secrets, ...publicCv } = ctx.cv
      ctx.stdout.line(JSON.stringify(publicCv, null, 2))
      return 0
    }
    printSummary(ctx)
    ctx.panel.navigate({ section: 'top' })
    return 0
  },
} satisfies Command
