import type { Command } from '../types'

export default {
  name: 'help',
  aliases: ['?'],
  description: 'List available commands',
  usage: 'help [command]',
  complete: (_argv, ctx) => ctx.registry.list().filter(c => !c.hidden).map(c => c.name),
  run(argv, ctx) {
    const name = argv[0]
    if (name) {
      const cmd = ctx.registry.get(name)
      if (!cmd) {
        ctx.stderr.line(`help: no such command: ${name}`)
        return 1
      }
      ctx.stdout.line(cmd.description)
      ctx.stdout.line(`usage: ${cmd.usage}`)
      return 0
    }
    const visible = ctx.registry.list().filter(c => !c.hidden)
    const width = Math.max(10, ...visible.map(c => c.name.length + 2))
    for (const cmd of visible) {
      ctx.stdout.write(cmd.name.padEnd(width), 'accent')
      ctx.stdout.line(cmd.description)
    }
    ctx.stdout.line()
    ctx.stdout.line('Tab completes, ↑/↓ recall history, | pipes. Try: cat about.md | grep lead', 'dim')
    return 0
  },
} satisfies Command
