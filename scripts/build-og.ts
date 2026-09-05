import { readFile, writeFile } from 'node:fs/promises';

import { chromium } from '@playwright/test';

import { DEFAULT_SITE_HOST } from '../shared/site-host.ts';

interface Profile {
  name: string;
  title: string;
  tagline?: string;
}

interface Card {
  file: string;
  command: string;
  heading: string;
  subheading: string;
  line: string;
}

const WIDTH = 1200;
const HEIGHT = 630;
const FONT =
  'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function cards(profile: Profile): Card[] {
  return [
    {
      file: 'public/og.png',
      command: 'whoami',
      heading: profile.name,
      subheading: profile.title,
      line: profile.tagline ?? '',
    },
    {
      file: 'public/og-dotfiles.png',
      command: 'ls -a ~/.config',
      heading: 'Dotfiles',
      subheading: `Config files ${profile.name} uses every day`,
      line: 'Read them, copy them with one click, or cat them in the terminal.',
    },
  ];
}

function cardHtml(card: Card, font: string): string {
  return `<!doctype html>
<style>
  @font-face { font-family: 'JetBrains Mono'; src: url(data:font/woff2;base64,${font}) format('woff2-variations'); font-weight: 100 800; }
  html, body { margin: 0; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px; box-sizing: border-box; padding: 72px 84px;
    display: flex; flex-direction: column; justify-content: space-between;
    background: #10141c; color: #e8e6e1; font-family: 'JetBrains Mono', monospace;
  }
  .prompt { font-size: 28px; color: #9aa3b0; }
  .prompt b { color: #c7a4ff; font-weight: 500; }
  .prompt span { color: #e8e6e1; }
  h1 { margin: 0; font-size: 84px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05; }
  h2 { margin: 18px 0 0; font-size: 34px; font-weight: 500; color: #e3b341; }
  p { margin: 28px 0 0; font-size: 28px; line-height: 1.4; color: #9aa3b0; max-width: 980px; }
  footer { display: flex; align-items: center; justify-content: space-between; font-size: 26px; color: #9aa3b0; }
  .cursor { display: inline-block; width: 16px; height: 30px; margin-left: 12px; vertical-align: -4px; background: #e8e6e1; }
</style>
<div class="prompt"><b>hamed@${DEFAULT_SITE_HOST}</b>:~$ <span>${escapeHtml(card.command)}</span></div>
<div>
  <h1>${escapeHtml(card.heading)}</h1>
  <h2>${escapeHtml(card.subheading)}</h2>
  <p>${escapeHtml(card.line)}</p>
</div>
<footer><span>${DEFAULT_SITE_HOST}</span><span>hamed@${DEFAULT_SITE_HOST}:~$<i class="cursor"></i></span></footer>`;
}

async function main(): Promise<void> {
  const profile = JSON.parse(await readFile('content/profile.json', 'utf8')) as Profile;
  const font = (await readFile(FONT)).toString('base64');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  for (const card of cards(profile)) {
    await page.setContent(cardHtml(card, font));
    await page.evaluate(() => document.fonts.ready);
    await writeFile(card.file, await page.screenshot({ type: 'png' }));
    console.warn(`[og] wrote ${card.file}`);
  }
  await browser.close();
}

await main();
