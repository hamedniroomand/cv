import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';

import type { Page } from '@playwright/test';
import { chromium } from '@playwright/test';

interface IconTarget {
  size: number;
  file: string;
}

interface IconPng {
  size: number;
  data: Buffer;
}

const SVG = 'public/favicon.svg';
const ICO = 'public/favicon.ico';
const ICO_SIZES = [16, 32];
const TARGETS: IconTarget[] = [
  { size: 16, file: 'public/favicon-16.png' },
  { size: 32, file: 'public/favicon-32.png' },
  { size: 180, file: 'public/apple-touch-icon.png' },
  { size: 512, file: 'public/icon-512.png' },
];

const ICO_HEADER_BYTES = 6;
const ICO_ENTRY_BYTES = 16;

function icoHeader(count: number): Buffer {
  const header = Buffer.alloc(ICO_HEADER_BYTES);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  return header;
}

function icoEntry(png: IconPng, offset: number): Buffer {
  const dimension = png.size === 256 ? 0 : png.size;
  const entry = Buffer.alloc(ICO_ENTRY_BYTES);
  entry.writeUInt8(dimension, 0);
  entry.writeUInt8(dimension, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.data.length, 8);
  entry.writeUInt32LE(offset, 12);
  return entry;
}

function packIco(pngs: IconPng[]): Buffer {
  let offset = ICO_HEADER_BYTES + ICO_ENTRY_BYTES * pngs.length;
  const entries = pngs.map(png => {
    const entry = icoEntry(png, offset);
    offset += png.data.length;
    return entry;
  });
  return Buffer.concat([icoHeader(pngs.length), ...entries, ...pngs.map(png => png.data)]);
}

function iconDocument(svg: string, size: number): string {
  return `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`;
}

async function renderIcon(page: Page, svg: string, size: number): Promise<Buffer> {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(iconDocument(svg, size));
  return Buffer.from(await page.screenshot({ omitBackground: true, type: 'png' }));
}

async function main(): Promise<void> {
  const svg = await readFile(SVG, 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const rendered = new Map<number, Buffer>();
  for (const { size, file } of TARGETS) {
    const png = await renderIcon(page, svg, size);
    await writeFile(file, png);
    rendered.set(size, png);
    console.warn(`[icons] wrote ${file}`);
  }
  await browser.close();
  await writeFile(ICO, packIco(ICO_SIZES.map(size => ({ size, data: rendered.get(size)! }))));
  console.warn(`[icons] wrote ${ICO} (${ICO_SIZES.join(' + ')})`);
}

await main();
