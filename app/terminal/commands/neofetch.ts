import type { Command, LineStyle, Span } from '../types'
import { totalYears } from '#shared/cv/format'
import { portrait } from '../art/portrait'

const ART_GAP = '    '
const COLOUR_STYLES: LineStyle[] = [
  'dim',
  'error',
  'success',
  'accent',
  'plain',
  'prompt',
  'accent',
  'plain',
]

function colourBlocks(): Span[] {
  return COLOUR_STYLES.map(style => ({ text: '█', style }))
}

function siteHost(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname
  }
  catch {
    return 'hamed.sh'
  }
}

export default {
  name: 'neofetch',
  description: 'Display system and resume information',
  usage: 'neofetch',
  run(_argv, ctx) {
    const skillCount = ctx.cv.skills.categories
      .reduce((count, category) => count + category.items.length, 0)
    const info: Array<string | Span[]> = [
      `${ctx.env.user}@${ctx.env.host}`,
      '-----------------',
      'OS:       hamed.sh 1.0 (Nuxt 5 / Bun)',
      `Host:     ${siteHost(ctx.env.siteUrl)}`,
      'Kernel:   TypeScript 5',
      `Uptime:   ${totalYears(ctx.cv.experience)} years in production`,
      `Packages: ${skillCount} (skills.json)`,
      'Shell:    hamed-sh',
      `Theme:    ${ctx.env.theme}`,
      'Terminal: en_US',
      colourBlocks(),
    ]
    const artWidth = Math.max(...portrait.map(line => line.length))
    const lineCount = Math.max(portrait.length, info.length)

    for (let i = 0; i < lineCount; i++) {
      const art = portrait[i] ?? ''
      const details = info[i]
      ctx.stdout.raw([{ text: `${art.padEnd(artWidth)}${ART_GAP}`, style: 'pre' }])
      if (typeof details === 'string')
        ctx.stdout.write(details)
      else if (details)
        ctx.stdout.raw(details)
      ctx.stdout.line()
    }

    return 0
  },
} satisfies Command
