import { readFile, writeFile } from 'node:fs/promises';

import { chromium } from '@playwright/test';

import { listMarkdown, readMarkdown, slugOf } from '../modules/cv-content/read.ts';
import { ogCardFile } from '../shared/cv/og-card.ts';
import { DEFAULT_SITE_HOST } from '../shared/site-host.ts';

interface Profile {
  name: string;
  title: string;
  tagline?: string;
}

interface Card {
  file: string;
  /** The small line above the heading, in capitals. */
  eyebrow: string;
  /** The path shown at the right of the eyebrow row. */
  path: string;
  heading: string;
  /** The second part of the heading. It takes the accent colour. */
  accent: string;
  line: string;
}

const WIDTH = 1200;
const HEIGHT = 630;
const FONT =
  'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2';

/** The dark theme of the site. Keep these values equal to `app/assets/css/themes.css`. */
const THEME = {
  bg: '#151615',
  fg: '#eeeae2',
  dim: '#a3a59d',
  accent: '#dcb66d',
  accent2: '#a0bdb2',
  border: '#30332e',
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Each project gets a card of its own, so a shared link shows the project and not the home page. */
async function projectCards(): Promise<Card[]> {
  const cards: Card[] = [];
  for (const name of await listMarkdown('content/projects')) {
    const { data } = await readMarkdown(`content/projects/${name}`);
    const project = data as { name?: string; tagline?: string };
    if (!project.name || !project.tagline) continue;
    cards.push({
      file: `public/${ogCardFile(slugOf(name))}`,
      eyebrow: 'PROJECT',
      path: `~/projects/${slugOf(name)}`,
      heading: `${project.name}.`,
      accent: project.tagline,
      line: `A project by Hamed Niroomand. Read it at ${DEFAULT_SITE_HOST}.`,
    });
  }
  return cards;
}

function cards(profile: Profile): Card[] {
  return [
    {
      file: `public/${ogCardFile('home')}`,
      eyebrow: 'A PERSONAL WORKSHOP',
      path: '~/hamed',
      heading: 'Useful things.',
      accent: 'Built with curiosity.',
      line: 'Projects, tools and experiments by Hamed Niroomand.',
    },
    {
      file: `public/${ogCardFile('resume')}`,
      eyebrow: 'CURRICULUM VITAE',
      path: '~/hamed/cv',
      heading: profile.name,
      accent: profile.title,
      line: profile.tagline ?? '',
    },
    {
      file: `public/${ogCardFile('dotfiles')}`,
      eyebrow: 'BEHIND THE SCENES',
      path: '~/.config',
      heading: 'Dotfiles.',
      accent: 'Borrow what is useful.',
      line: `The configuration files that ${profile.name} uses every day.`,
    },
  ];
}

/** A long heading needs a smaller size, or it fills the whole card. */
function headingSize(card: Card): number {
  const longest = Math.max(card.heading.length, card.accent.length);
  if (longest > 34) return 60;
  if (longest > 24) return 71;
  return 82;
}

function cardHtml(card: Card, font: string): string {
  return `<!doctype html>
<style>
  @font-face { font-family: 'JetBrains Mono'; src: url(data:font/woff2;base64,${font}) format('woff2-variations'); font-weight: 100 800; }
  html, body { margin: 0; }
  body {
    position: relative; isolation: isolate; overflow: hidden;
    width: ${WIDTH}px; height: ${HEIGHT}px; box-sizing: border-box; padding: 68px 84px;
    display: flex; flex-direction: column; justify-content: space-between;
    background: ${THEME.bg}; color: ${THEME.fg};
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  /*
   * The dot grid that the site draws behind its pages.
   * The site also draws two pools of accent light, but a card leaves them out.
   * A browser dithers a large gradient, and the noise makes the PNG 2.5 times larger.
   * At the size of a link preview the light is not visible, so the card keeps only the grid.
   */
  body::before {
    content: ''; position: absolute; z-index: -2; inset: 0;
    background-image: radial-gradient(circle at 1px 1px, rgb(238 234 226 / 9%) 1px, transparent 0);
    background-size: 34px 34px;
    mask-image: radial-gradient(125% 85% at 50% 0%, #000 15%, transparent 78%);
  }
  .eyebrow {
    display: flex; align-items: center; gap: 14px;
    font: 17px 'JetBrains Mono', monospace; letter-spacing: 2.7px; color: ${THEME.dim};
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: ${THEME.accent}; }
  .eyebrow .path { margin-left: auto; letter-spacing: 0; }
  h1 { margin: 0; font-size: ${headingSize(card)}px; font-weight: 500; letter-spacing: -0.05em; line-height: 1.07; }
  h1 span { color: ${THEME.accent}; }
  p { margin: 26px 0 0; font-size: 26px; line-height: 1.6; color: ${THEME.dim}; max-width: 900px; }
  footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 30px; border-top: 1px solid ${THEME.border};
    font: 20px 'JetBrains Mono', monospace; color: ${THEME.dim};
  }
  .cursor { display: inline-block; width: 11px; height: 22px; margin-left: 10px; vertical-align: -3px; background: ${THEME.accent}; }
</style>
<div class="eyebrow"><i class="dot"></i>${escapeHtml(card.eyebrow)}<span class="path">${escapeHtml(card.path)}</span></div>
<div>
  <h1>${escapeHtml(card.heading)}<br /><span>${escapeHtml(card.accent)}</span></h1>
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
  for (const card of [...cards(profile), ...(await projectCards())]) {
    await page.setContent(cardHtml(card, font));
    await page.evaluate(() => document.fonts.ready);
    await writeFile(card.file, await page.screenshot({ type: 'png' }));
    console.warn(`[og] wrote ${card.file}`);
  }
  await browser.close();
}

await main();
