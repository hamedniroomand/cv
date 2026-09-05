import { describe, expect, it } from 'vite-plus/test';

import { commands } from '~/terminal/commands';
import { completeLine } from '~/terminal/shell/completion';
import { makeShell } from '~~/tests/unit/fixtures/context';
import { fixtureCv } from '~~/tests/unit/fixtures/cv';

describe('whoami', () => {
  it('prints identity, links and the hint, then navigates top', async () => {
    const term = makeShell(commands);
    expect((await term.exec('whoami')).code).toBe(0);
    const out = term.text();
    expect(out).toContain('Hamed Niroomand');
    expect(out).toContain('Frontend Team Lead / Senior TypeScript Engineer');
    expect(out).toContain('Yerevan, Armenia (UTC+4) · Remote');
    expect(out).toContain(
      "Type 'help', run 'hamed' for the guided mode — or just read the panel →",
    );
    const hrefs = term.lines
      .flatMap(l => l.spans)
      .map(sp => sp.href)
      .filter(Boolean);
    expect(hrefs).toContain('https://github.com/hamedniroomand');
    expect(hrefs).toContain('mailto:me@example.com');
    expect(term.calls.navigate).toEqual([{ section: 'top' }]);
  });

  it('omits the remote tag when not remote', async () => {
    const term = makeShell(commands, {
      cv: { ...fixtureCv, profile: { ...fixtureCv.profile, remote: false } },
    });
    await term.exec('whoami');
    expect(term.text()).toContain('Yerevan, Armenia (UTC+4)');
    expect(term.text()).not.toContain('· Remote');
  });
});

describe('open', () => {
  it('opens known targets', async () => {
    const term = makeShell(commands);
    await term.exec('open github');
    await term.exec('open linkedin');
    await term.exec('open email');
    await term.exec('open cue');
    await term.exec('open https://example.test/x');
    expect(term.calls.opened).toEqual([
      'https://github.com/hamedniroomand',
      'https://linkedin.com/in/example',
      'mailto:me@example.com',
      'https://github.com/hamedniroomand/cue',
      'https://example.test/x',
    ]);
  });

  it('pdf downloads', async () => {
    const term = makeShell(commands);
    await term.exec('open pdf');
    expect(term.calls.downloads).toEqual(['/hamed-niroomand-cv.pdf']);
  });

  it('lists targets on unknown input', async () => {
    const term = makeShell(commands);
    expect((await term.exec('open zzz')).code).toBe(1);
    expect(term.text()).toMatch(/github, linkedin, email, cue, pdf/);
    expect((await term.exec('open')).code).toBe(1);
  });

  it('falls back when cue is missing', async () => {
    const term = makeShell(commands, {
      cv: { ...fixtureCv, projects: [{ ...fixtureCv.projects[0]!, slug: 'other', repo: 'o/r' }] },
    });
    await term.exec('open cue');
    expect(term.calls.opened).toEqual(['https://github.com/o/r']);
    const empty = makeShell(commands, { cv: { ...fixtureCv, projects: [] } });
    expect((await empty.exec('open cue')).code).toBe(1);
  });

  it('completes targets', () => {
    const term = makeShell(commands);
    expect(completeLine('open gi', term.completion)).toEqual({
      line: 'open github ',
      candidates: ['github'],
    });
  });
});

describe('cv', () => {
  it('prints a summary and navigates top', async () => {
    const term = makeShell(commands);
    await term.exec('cv');
    expect(term.text()).toContain('Hamed Niroomand');
    expect(term.text()).toContain('Team Lead @ Acme');
    expect(term.calls.navigate).toEqual([{ section: 'top' }]);
  });

  it('--pdf downloads the resume', async () => {
    const term = makeShell(commands);
    await term.exec('cv --pdf');
    expect(term.calls.downloads).toEqual(['/hamed-niroomand-cv.pdf']);
    expect(term.text()).toBe('Downloading hamed-niroomand-cv.pdf…');
  });

  it('--json dumps the data', async () => {
    const term = makeShell(commands);
    await term.exec('cv --json | head -n 1');
    expect(term.text()).toBe('{');
    const other = makeShell(commands);
    await other.exec('cv --json | grep -c secrets');
    expect(other.text()).toBe('0');
  });

  it('completes flags', () => {
    const term = makeShell(commands);
    expect(completeLine('cv --p', term.completion)).toEqual({
      line: 'cv --pdf ',
      candidates: ['--pdf'],
    });
  });
});

describe('contact', () => {
  it('prints links, navigates and opens the modal', async () => {
    const term = makeShell(commands);
    await term.exec('contact');
    expect(term.text()).toContain('me@example.com');
    expect(term.calls.navigate).toEqual([{ section: 'contact' }]);
    expect(term.calls.modals).toEqual(['contact']);
  });
});

describe('skills', () => {
  it('prints every category', async () => {
    const term = makeShell(commands);
    await term.exec('skills');
    expect(term.text()).toBe('Frontend\n  Vue 3, Nuxt 4\nBackend\n  Bun, NestJS (APIs)');
    expect(term.calls.navigate).toEqual([{ section: 'skills' }]);
  });

  it('filters by --category', async () => {
    const term = makeShell(commands);
    await term.exec('skills --category backend');
    expect(term.text()).toBe('Backend\n  Bun, NestJS (APIs)');
  });

  it('rejects unknown categories', async () => {
    const term = makeShell(commands);
    expect((await term.exec('skills --category zzz')).code).toBe(1);
    expect(term.text()).toBe("skills: unknown category 'zzz' (try: frontend, backend)");
  });

  it('completes category ids', () => {
    const term = makeShell(commands);
    const ctx = term.completion;
    expect(completeLine('skills --category f', ctx).line).toBe('skills --category frontend ');
    expect(completeLine('skills -', ctx).candidates).toEqual(['--category']);
  });
});
