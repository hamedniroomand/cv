import { describe, expect, it } from 'vite-plus/test';

import { totalYears } from '#shared/cv/format';
import { commands } from '~/terminal/commands';
import { makeShell } from '~~/tests/unit/fixtures/context';
import { fixtureCv } from '~~/tests/unit/fixtures/cv';
import { lineText } from '~~/tests/unit/fixtures/output';

describe('neofetch', () => {
  it('renders an aligned portrait with live resume and environment details', async () => {
    const env = {
      user: 'hamed',
      host: 'terminal.test',
      lang: 'fa' as const,
      theme: 'gruvbox' as const,
      siteUrl: 'https://cv.example.test/resume',
    };
    const expectedYears = totalYears(fixtureCv.experience);
    const expectedSkillCount = fixtureCv.skills.categories.reduce(
      (count, category) => count + category.items.length,
      0,
    );
    const expectedInfo = [
      `${env.user}@${env.host}`,
      '-----------------',
      'OS:       hamed.sh 1.0 (Nuxt 5 / Bun)',
      `Host:     ${env.host}`,
      'Kernel:   TypeScript 5',
      `Uptime:   ${expectedYears} years in production`,
      `Packages: ${expectedSkillCount} (skills.json)`,
      'Shell:    hamed-sh',
      `Theme:    ${env.theme}`,
      'Terminal: en_US',
      '████████',
    ];
    const term = makeShell(commands, { env });

    expect((await term.exec('neofetch')).code).toBe(0);

    const expectedArtLength = 12;
    expect(term.lines).toHaveLength(Math.max(expectedArtLength, expectedInfo.length));

    const artSpans = term.lines.map(line => line.spans[0]);
    expect(artSpans.every(span => span?.style === 'pre')).toBe(true);
    expect(new Set(artSpans.map(span => span?.text.length)).size).toBe(1);
    expect(artSpans.every(span => span?.text.endsWith('    '))).toBe(true);

    const info = term.lines.map(line => lineText({ ...line, spans: line.spans.slice(1) }));
    expect(info).toEqual([...expectedInfo, '']);

    const colourBlocks = term.lines[expectedInfo.length - 1]!.spans.slice(1);
    expect(colourBlocks).toHaveLength(8);
    expect(colourBlocks.map(span => span.text)).toEqual(Array.from({ length: 8 }).fill('█'));
    expect(colourBlocks.map(span => span.style)).toEqual([
      'dim',
      'error',
      'success',
      'accent',
      'plain',
      'prompt',
      'accent',
      'plain',
    ]);
  });

  it('falls back to the shell hostname for a malformed site URL', async () => {
    const term = makeShell(commands, {
      env: {
        user: 'hamed',
        host: 'hamed.sh',
        lang: 'en',
        theme: 'dark',
        siteUrl: 'not a URL',
      },
    });

    expect((await term.exec('neofetch')).code).toBe(0);
    const info = term.lines.map(line => lineText({ ...line, spans: line.spans.slice(1) }));
    expect(info).toContain('Host:     hamed.sh');
  });
});
