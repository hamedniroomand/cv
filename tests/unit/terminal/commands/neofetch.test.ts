import { describe, expect, it } from 'vitest'
import { totalYears } from '#shared/cv/format'
import { commands } from '~/terminal/commands'
import { makeShell } from '../../fixtures/context'
import { fixtureCv } from '../../fixtures/cv'

describe('neofetch', () => {
  it('renders an aligned portrait with live resume and environment details', async () => {
    const env = {
      user: 'hamed',
      host: 'terminal.test',
      lang: 'fa' as const,
      theme: 'gruvbox' as const,
      siteUrl: 'https://cv.example.test/resume',
    }
    const expectedYears = totalYears(fixtureCv.experience)
    const expectedSkillCount = fixtureCv.skills.categories
      .reduce((count, category) => count + category.items.length, 0)
    const expectedInfo = [
      `${env.user}@${env.host}`,
      '-----------------',
      'OS:       hamed.sh 1.0 (Nuxt 5 / Bun)',
      `Host:     ${new URL(env.siteUrl).hostname}`,
      'Kernel:   TypeScript 5',
      `Uptime:   ${expectedYears} years in production`,
      `Packages: ${expectedSkillCount} (skills.json)`,
      'Shell:    hamed-sh',
      `Theme:    ${env.theme}`,
      'Terminal: en_US',
      '████████',
    ]
    const s = makeShell(commands, { env })

    expect((await s.shell.exec('neofetch')).code).toBe(0)

    const expectedArtLength = 12
    expect(s.lines).toHaveLength(Math.max(expectedArtLength, expectedInfo.length))

    const artSpans = s.lines.map(line => line.spans[0])
    expect(artSpans.every(span => span?.style === 'pre')).toBe(true)
    expect(new Set(artSpans.map(span => span?.text.length)).size).toBe(1)
    expect(artSpans.every(span => span?.text.endsWith('    '))).toBe(true)

    const info = s.lines.map(line => line.spans.slice(1).map(span => span.text).join(''))
    expect(info).toEqual([...expectedInfo, ''])

    const colourBlocks = s.lines[expectedInfo.length - 1]!.spans.slice(1)
    expect(colourBlocks).toHaveLength(8)
    expect(colourBlocks.every(span => span.text === '█' && span.style !== undefined)).toBe(true)
  })
})
