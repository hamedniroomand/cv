import { Buffer } from 'node:buffer';
import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';

import type { Page } from '@playwright/test';
import { chromium } from '@playwright/test';

/** A picture this script can take on its own, from a live site. */
interface Shot {
  file: string;
  url: string;
  /** Puts the product into the state worth showing. */
  prepare: (page: Page) => Promise<void>;
}

/** A picture only a person can take. The script draws a stand-in until that picture arrives. */
interface Placeholder {
  file: string;
  label: string;
  title: string;
  note: string;
}

const WIDTH = 1440;
const HEIGHT = 810;
const OUT = 'public/screenshots';
/** The page shows these pictures far smaller than their real size, so a small loss is invisible. */
const WEBP_QUALITY = 0.9;

const SHOTS: Shot[] = [
  {
    file: 'kitdev-sqlite-studio.webp',
    url: 'https://kitdev.space/hub/data/sqlite-studio',
    async prepare(page) {
      await page.getByText('Load Sample Database', { exact: true }).click();
      await page.getByRole('button', { name: 'Run Query' }).waitFor({ timeout: 15_000 });
      await page.getByText('products', { exact: true }).click();
      await page.getByText('Mechanical Keyboard').waitFor({ timeout: 15_000 });
    },
  },
  {
    file: 'waverune-demo.webp',
    url: 'https://hamedniroomand.github.io/waverune/',
    async prepare(page) {
      // The demo stores its theme itself and defaults to light. The site's cards are dark.
      await page.evaluate(() => {
        localStorage.setItem('waverune-theme', 'dark');
        document.documentElement.dataset.theme = 'dark';
      });
      await page.getByRole('heading', { level: 1 }).waitFor({ timeout: 15_000 });
    },
  },
];

const PLACEHOLDERS: Placeholder[] = [
  {
    file: 'cue-issue.webp',
    label: 'cue / issue',
    title: 'A real issue goes here.',
    note: 'Save the capture as public/screenshots/cue-issue.png, then run `bun run screenshots`.',
  },
  {
    file: 'cue-dashboard.webp',
    label: 'cue / dashboard',
    title: 'The dashboard goes here.',
    note: 'Save the capture as public/screenshots/cue-dashboard.png, then run `bun run screenshots`.',
  },
];

/**
 * Re-encodes a PNG as WebP inside the browser.
 * Chromium does this, so the build needs no image library and no system tool.
 */
async function toWebp(page: Page, png: Buffer): Promise<Buffer> {
  const url = await page.evaluate(
    async ([data, quality]) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d')!.drawImage(image, 0, 0);
      return canvas.toDataURL('image/webp', quality);
    },
    [png.toString('base64'), WEBP_QUALITY] as const,
  );
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function placeholderHtml(placeholder: Placeholder): string {
  return `<!doctype html><style>
  html, body { margin: 0; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px; box-sizing: border-box; padding: 64px 72px;
    display: flex; flex-direction: column; justify-content: space-between;
    background: #151615; color: #eeeae2;
    background-image: radial-gradient(circle at 1px 1px, rgb(238 234 226 / 9%) 1px, transparent 0);
    background-size: 34px 34px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .bar { display: flex; align-items: center; gap: 12px; font-size: 20px; color: #a3a59d; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: #dcb66d; }
  h1 { margin: 0; font-size: 54px; font-weight: 500; letter-spacing: -2px;
       font-family: system-ui, sans-serif; }
  p { margin: 18px 0 0; font-size: 22px; color: #a3a59d; }
  .prompt { font-size: 22px; color: #a3a59d; }
  .prompt b { color: #dcb66d; font-weight: 400; }
</style>
<div class="bar"><i class="dot"></i>${placeholder.label}</div>
<div><h1>${placeholder.title}</h1><p>${placeholder.note}</p></div>
<div class="prompt"><b>$</b> cue start</div>`;
}

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });

  for (const shot of SHOTS) {
    await page.goto(shot.url, { waitUntil: 'networkidle' });
    await shot.prepare(page);
    await page.evaluate(() => document.fonts.ready);
    const webp = await toWebp(page, await page.screenshot({ type: 'png' }));
    await writeFile(`${OUT}/${shot.file}`, webp);
    console.warn(`[screenshots] wrote ${shot.file} (${(webp.length / 1024).toFixed(0)} KB)`);
  }

  // A picture you add by hand becomes WebP too. Save the PNG here and run this script.
  for (const name of await readdir(OUT)) {
    if (!name.endsWith('.png')) continue;
    const webp = await toWebp(page, await readFile(`${OUT}/${name}`));
    await writeFile(`${OUT}/${name.replace(/\.png$/, '.webp')}`, webp);
    await rm(`${OUT}/${name}`);
    console.warn(`[screenshots] converted ${name} (${(webp.length / 1024).toFixed(0)} KB)`);
  }

  // A stand-in is drawn only while the real picture is missing, so it never overwrites one.
  for (const placeholder of PLACEHOLDERS) {
    if (await exists(`${OUT}/${placeholder.file}`)) continue;
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.setContent(placeholderHtml(placeholder));
    await page.evaluate(() => document.fonts.ready);
    const webp = await toWebp(page, await page.screenshot({ type: 'png' }));
    await writeFile(`${OUT}/${placeholder.file}`, webp);
    console.warn(`[screenshots] wrote ${placeholder.file} (placeholder)`);
  }

  await browser.close();
}

await main();
