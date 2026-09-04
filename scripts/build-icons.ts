/**
 * Render public/favicon.svg to the raster sizes browsers still ask for, and pack a real .ico.
 * Run after changing the SVG: `bun run scripts/build-icons.ts`
 */
import { Buffer } from 'node:buffer'
import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const SVG = 'public/favicon.svg'
const TARGETS: { size: number, file: string }[] = [
  { size: 16, file: 'public/favicon-16.png' },
  { size: 32, file: 'public/favicon-32.png' },
  { size: 180, file: 'public/apple-touch-icon.png' },
  { size: 512, file: 'public/icon-512.png' },
]

/** ICO container with PNG-encoded entries (supported by every current browser and Windows ≥ Vista). */
function packIco(pngs: { size: number, data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)
  const dirSize = 16 * pngs.length
  let offset = 6 + dirSize
  const entries: Buffer[] = []
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size === 256 ? 0 : size, 0)
    e.writeUInt8(size === 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // planes
    e.writeUInt16LE(32, 6) // bpp
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    entries.push(e)
  }
  return Buffer.concat([header, ...entries, ...pngs.map(p => p.data)])
}

const svg = await readFile(SVG, 'utf8')
const browser = await chromium.launch()
const page = await browser.newPage()
const rendered: Record<number, Buffer> = {}
for (const { size, file } of TARGETS) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`)
  const png = await page.screenshot({ omitBackground: true, type: 'png' })
  await writeFile(file, png)
  rendered[size] = Buffer.from(png)
  console.warn(`[icons] wrote ${file}`)
}
await browser.close()
await writeFile('public/favicon.ico', packIco([{ size: 16, data: rendered[16]! }, { size: 32, data: rendered[32]! }]))
console.warn('[icons] wrote public/favicon.ico (16 + 32)')
