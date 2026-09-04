/**
 * Render /print to public/hamed-niroomand-cv.pdf with Playwright.
 *
 * - PDF_BASE_URL=http://localhost:3000  render against a running server
 * - otherwise the built server in .output is started on a spare port
 * - missing Playwright/Chromium or missing .output → warn and exit 0 so `nuxt build` never fails
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const OUT_NAME = 'hamed-niroomand-cv.pdf'
const MAX_PAGES = 2
const PORT = 3999

function log(msg: string): void {
  console.warn(`[pdf] ${msg}`)
}

async function waitFor(url: string, tries = 40): Promise<void> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok)
        return
    }
    catch {}
    await new Promise(r => setTimeout(r, 250))
  }
  throw new Error(`server did not answer at ${url}`)
}

function countPages(pdf: Uint8Array): number {
  const text = new TextDecoder('latin1').decode(pdf)
  return (text.match(/\/Type\s*\/Page(?!s)/g) ?? []).length
}

async function main(): Promise<number> {
  let chromium: typeof import('@playwright/test').chromium
  try {
    ({ chromium } = await import('@playwright/test'))
  }
  catch {
    log('@playwright/test not installed, skipping')
    return 0
  }

  let baseUrl = process.env.PDF_BASE_URL
  let server: ReturnType<typeof spawn> | undefined
  if (!baseUrl) {
    const entry = join(process.cwd(), '.output/server/index.mjs')
    if (!existsSync(entry)) {
      log('no .output build found and PDF_BASE_URL unset, skipping')
      return 0
    }
    server = spawn('bun', [entry], { env: { ...process.env, PORT: String(PORT), NITRO_PORT: String(PORT) }, stdio: 'ignore' })
    baseUrl = `http://localhost:${PORT}`
  }

  try {
    await waitFor(`${baseUrl}/api/cv`)
    let browser
    try {
      browser = await chromium.launch()
    }
    catch (err) {
      log(`could not launch Chromium (${(err as Error).message.split('\n')[0]}); run \`bunx playwright install chromium\`. Skipping.`)
      return 0
    }
    const page = await browser.newPage()
    await page.emulateMedia({ media: 'print' })
    await page.goto(`${baseUrl}/print`, { waitUntil: 'networkidle' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
    await browser.close()

    const pages = countPages(pdf)
    const targets = ['public']
    if (existsSync('.output/public'))
      targets.push('.output/public')
    for (const dir of targets) {
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, OUT_NAME), pdf)
    }
    log(`wrote ${OUT_NAME} (${pages} page${pages === 1 ? '' : 's'}, ${(pdf.byteLength / 1024).toFixed(0)} KB) to ${targets.join(', ')}`)
    if (pages > MAX_PAGES) {
      log(`FAIL: ${pages} pages exceeds the ${MAX_PAGES}-page limit`)
      return 1
    }
    return 0
  }
  finally {
    server?.kill()
  }
}

process.exit(await main())
