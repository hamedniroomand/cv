import type { Command } from '../types'
import { githubUrl, mailtoUrl, stripScheme } from '#shared/cv/links'
import { writeLink } from './_util'

export default {
  name: 'whoami',
  description: 'Who is this?',
  usage: 'whoami',
  run(_argv, ctx) {
    const { profile } = ctx.cv
    const { links, location } = profile
    ctx.stdout.line(profile.name, 'accent')
    ctx.stdout.line(profile.title)
    ctx.stdout.line(`Location: ${location.city}, ${location.country} (${location.tz})${profile.remote ? ' · Remote' : ''}`)
    writeLink(ctx.stdout, 'GitHub:   ', `github.com/${links.github}`, githubUrl(links.github))
    writeLink(ctx.stdout, 'LinkedIn: ', stripScheme(links.linkedin), links.linkedin)
    writeLink(ctx.stdout, 'Email:    ', links.email, mailtoUrl(links.email))
    ctx.stdout.line()
    ctx.stdout.line('Type \'help\', run \'hamed\' for the guided mode — or just read the panel →', 'dim')
    ctx.panel.navigate({ section: 'top' })
    return 0
  },
} satisfies Command
