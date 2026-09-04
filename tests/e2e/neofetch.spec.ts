import { expect, test } from '@playwright/test'
import { runCommand } from './helpers'

test('keeps portrait and information inline in the active theme accent', async ({ page }) => {
  await page.goto('/')
  await runCommand(page, 'theme gruvbox')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'gruvbox')
  await runCommand(page, 'neofetch')

  const firstLine = page.locator('.output__line:has(.s-pre)').first()
  await expect(firstLine).toContainText('@')

  const rendering = await firstLine.evaluate((line) => {
    const art = line.querySelector<HTMLElement>('.s-pre')
    const info = art?.nextElementSibling
    if (!art || !(info instanceof HTMLElement))
      return null

    const probe = document.createElement('span')
    probe.style.color = 'var(--accent)'
    document.body.appendChild(probe)
    const accent = getComputedStyle(probe).color
    probe.remove()

    const artBox = art.getBoundingClientRect()
    const infoBox = info.getBoundingClientRect()
    return {
      accent,
      artColor: getComputedStyle(art).color,
      sameLine: Math.abs(artBox.top - infoBox.top) < 1 && artBox.right <= infoBox.left,
    }
  })

  expect(rendering).not.toBeNull()
  expect.soft(rendering?.sameLine).toBe(true)
  expect.soft(rendering?.artColor).toBe(rendering?.accent)
})
