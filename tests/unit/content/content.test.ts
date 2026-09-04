import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../../modules/cv-content/load'

const dir = fileURLToPath(new URL('../../../content', import.meta.url))

describe('content rules', () => {
  it('has no design-pattern name-dropping in highlights', async () => {
    const cv = await loadContent(dir, async () => null)
    const text = cv.experience.flatMap(e => e.highlights.map(h => h.body)).join('\n').toLowerCase()
    for (const word of ['singleton', 'factory pattern', 'observer pattern', 'solid principles', 'clean architecture'])
      expect(text).not.toContain(word)
  })
  it('orders experience newest first by the order field', async () => {
    const cv = await loadContent(dir, async () => null)
    const orders = cv.experience.map(e => e.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })
})
