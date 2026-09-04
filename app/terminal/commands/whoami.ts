import type { Command } from '../types'

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
    ctx.stdout.write('GitHub:   ')
    ctx.stdout.link(`github.com/${links.github}`, `https://github.com/${links.github}`)
    ctx.stdout.line()
    ctx.stdout.write('LinkedIn: ')
    ctx.stdout.link(links.linkedin.replace(/^https?:\/\//, ''), links.linkedin)
    ctx.stdout.line()
    ctx.stdout.write('Email:    ')
    ctx.stdout.link(links.email, `mailto:${links.email}`)
    ctx.stdout.line()
    ctx.stdout.line()
    ctx.stdout.line('Type \'help\', run \'hamed\' for the guided mode — or just read the panel →', 'dim')
    ctx.panel.navigate({ section: 'top' })
    return 0
  },
} satisfies Command
