import type { Command } from '../types'

export default {
  name: 'contact',
  description: 'Get in touch',
  usage: 'contact',
  async run(_argv, ctx) {
    const { links } = ctx.cv.profile
    ctx.stdout.write('Email:    ')
    ctx.stdout.link(links.email, `mailto:${links.email}`)
    ctx.stdout.line()
    ctx.stdout.write('GitHub:   ')
    ctx.stdout.link(`github.com/${links.github}`, `https://github.com/${links.github}`)
    ctx.stdout.line()
    ctx.stdout.write('LinkedIn: ')
    ctx.stdout.link(links.linkedin.replace(/^https?:\/\//, ''), links.linkedin)
    ctx.stdout.line()
    ctx.panel.navigate({ section: 'contact' })
    await ctx.ui.openModal('contact')
    return 0
  },
} satisfies Command
