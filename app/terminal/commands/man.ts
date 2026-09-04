import type { Command, CommandContext } from '../types'
import { formatRange } from '#shared/cv/format'

function manHamed(ctx: CommandContext): void {
  const { profile, skills, experience } = ctx.cv
  const out = ctx.stdout
  const latest = experience[0]
  const role = latest?.roles[0]
  out.line('HAMED(1)                       User Commands                       HAMED(1)', 'dim')
  out.line()
  out.line('NAME')
  out.line(`       hamed - ${profile.title}`)
  out.line()
  out.line('SYNOPSIS')
  out.line(`       hamed [--${skills.categories.map(c => c.id).join('] [--')}]`)
  out.line()
  out.line('DESCRIPTION')
  for (const line of wrap(profile.summary, 66))
    out.line(`       ${line}`)
  if (latest && role) {
    out.line()
    out.line(`       Currently: ${role.title} at ${latest.company} (${formatRange(role.start, role.end)}).`)
  }
  out.line()
  out.line('OPTIONS')
  for (const cat of skills.categories) {
    out.line(`       --${cat.id}`)
    for (const line of wrap(cat.items.map(i => i.name).join(', '), 60))
      out.line(`              ${line}`)
  }
  out.line()
  out.line('SEE ALSO')
  out.line('       whoami(1), cv(1), skills(1), contact(1)')
}

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (current && current.length + 1 + word.length > width) {
      lines.push(current)
      current = word
    }
    else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current)
    lines.push(current)
  return lines
}

export default {
  name: 'man',
  description: 'Show a manual page',
  usage: 'man <page>',
  complete: (_argv, ctx) => ['hamed', ...ctx.registry.list().filter(c => !c.hidden).map(c => c.name)],
  run(argv, ctx) {
    const page = argv[0]
    if (!page) {
      ctx.stderr.line('What manual page do you want?')
      return 1
    }
    if (page === 'hamed') {
      manHamed(ctx)
      return 0
    }
    const cmd = ctx.registry.get(page)
    if (!cmd) {
      ctx.stderr.line(`No manual entry for ${page}`)
      return 1
    }
    ctx.stdout.line(`${cmd.name.toUpperCase()}(1)`, 'dim')
    ctx.stdout.line()
    ctx.stdout.line('NAME')
    ctx.stdout.line(`       ${cmd.name} - ${cmd.description}`)
    ctx.stdout.line()
    ctx.stdout.line('SYNOPSIS')
    ctx.stdout.line(`       ${cmd.usage}`)
    return 0
  },
} satisfies Command
