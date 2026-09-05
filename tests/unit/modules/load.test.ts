import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import type { LoadDeps } from '~~/modules/cv-content/load';
import { loadContent } from '~~/modules/cv-content/load';

const dir = resolve('content');

const stubHighlight: LoadDeps['highlight'] = (code, lang) =>
  `<div class="shj shj-lang-${lang}" data-lang="${lang}"><div class="shj-code">${code}</div></div>`;

function deps(overrides: Partial<LoadDeps> = {}): LoadDeps {
  return {
    fetchReadme: async () => null,
    fetchGist: async () => null,
    highlight: stubHighlight,
    ...overrides,
  };
}

async function contentCopy(): Promise<string> {
  const tmp = await mkdtemp(join(tmpdir(), 'cv-content-'));
  await cp(dir, tmp, { recursive: true });
  return tmp;
}

describe('loadContent', () => {
  it('loads and validates the real content directory', async () => {
    const cv = await loadContent(dir, deps());
    expect(cv.profile.name).toBe('Hamed Niroomand');
    expect(cv.experience.map(e => e.slug)).toEqual([
      'jack-westin',
      'thales',
      'faro-creaform',
      'joorchin',
      'xankoo',
    ]);
    expect(cv.experience[0]!.highlights.map(h => h.slug)).toEqual([
      'team-lead',
      'design-system',
      'micro-frontends',
      'learning-products',
      'ai-tutor',
      'engineering-standards',
    ]);
    expect(cv.projects[0]!.readmeSource).toBe('fallback');
    expect(cv.skills.categories.length).toBeGreaterThan(3);
    expect(cv.secrets.body).toContain('vim');
  });

  it('uses the fetched README when available', async () => {
    const cv = await loadContent(dir, deps({ fetchReadme: async () => '# Cue\n\nfrom github' }));
    expect(cv.projects[0]!.readmeSource).toBe('github');
    expect(cv.projects[0]!.body).toContain('from github');
    expect(cv.projects[0]!.html).toContain('<h1>');
  });

  it('renders markdown to html', async () => {
    const cv = await loadContent(dir, deps());
    expect(cv.about.html).toContain('<p>');
    expect(cv.experience[0]!.highlights[0]!.html).toContain('<p>');
  });

  it('stamps generatedAt from the clock', async () => {
    const cv = await loadContent(dir, deps(), new Date('2026-09-04T00:00:00Z'));
    expect(cv.generatedAt).toBe('2026-09-04T00:00:00.000Z');
  });

  it('throws ContentError on invalid content', async () => {
    const tmp = await mkdtemp(join(tmpdir(), 'cv-bad-'));
    await writeFile(join(tmp, 'profile.json'), '{}');
    await expect(loadContent(tmp, deps())).rejects.toThrow(/content validation failed/);
  });
});

describe('loadContent dotfiles', () => {
  it('loads the committed vscode settings entry inline when the gist is unavailable', async () => {
    const cv = await loadContent(dir, deps());
    const vscode = cv.dotfiles.find(d => d.slug === 'vscode-settings')!;
    expect(vscode.path).toBe('~/.config/Code/User/settings.json');
    expect(vscode.lang).toBe('jsonc');
    expect(vscode.source).toBe('inline');
    expect(vscode.content).toContain('editor.fontFamily');
    expect(vscode.html).toContain('data-lang="jsonc"');
    expect(vscode.gistUrl).toBe(
      'https://gist.github.com/hamedniroomand/dc74c846d1e701c65779fdaf7d58e1bf',
    );
  });

  it('prefers gist content when fetched and records the source', async () => {
    const cv = await loadContent(
      dir,
      deps({ fetchGist: async (id, file) => `// ${id}/${file}\n{}` }),
    );
    const vscode = cv.dotfiles.find(d => d.slug === 'vscode-settings')!;
    expect(vscode.source).toBe('gist');
    expect(vscode.content).toBe('// dc74c846d1e701c65779fdaf7d58e1bf/VS Code settings\n{}');
  });

  it('sorts dotfiles by order and supports inline entries without a gist', async () => {
    const tmp = await contentCopy();
    await writeFile(
      join(tmp, 'dotfiles', 'zshrc.md'),
      '---\ntitle: Zsh\ndescription: Shell.\npath: ~/.zshrc\nlang: sh\norder: 0\n---\nexport EDITOR=vim\n',
    );
    const cv = await loadContent(tmp, deps());
    expect(cv.dotfiles.map(d => d.slug)).toEqual(['zshrc', 'vscode-settings']);
    expect(cv.dotfiles[0]!.source).toBe('inline');
    expect(cv.dotfiles[0]!.gistUrl).toBeUndefined();
  });

  it('rejects a dotfile whose first segment is a reserved home entry', async () => {
    const tmp = await contentCopy();
    await writeFile(
      join(tmp, 'dotfiles', 'bad.md'),
      '---\ntitle: Bad\ndescription: Bad.\npath: ~/about.md\nlang: json\norder: 5\n---\n{}\n',
    );
    await expect(loadContent(tmp, deps())).rejects.toThrow(/bad\.md.*reserved.*about\.md/);
  });

  it('rejects two dotfiles with the same path', async () => {
    const tmp = await contentCopy();
    await writeFile(
      join(tmp, 'dotfiles', 'dupe.md'),
      '---\ntitle: Dupe\ndescription: Dupe.\npath: ~/.config/Code/User/settings.json\nlang: json\norder: 5\n---\n{}\n',
    );
    await expect(loadContent(tmp, deps())).rejects.toThrow(
      /vscode-settings\.md.*duplicate path.*dupe\.md/,
    );
  });

  it('rejects an empty body', async () => {
    const tmp = await contentCopy();
    await writeFile(
      join(tmp, 'dotfiles', 'empty.md'),
      '---\ntitle: Empty\ndescription: Empty.\npath: ~/.empty\nlang: sh\norder: 5\n---\n',
    );
    await expect(loadContent(tmp, deps())).rejects.toThrow(/empty\.md.*body/);
  });

  it('loads without a dotfiles directory', async () => {
    const tmp = await contentCopy();
    await rm(join(tmp, 'dotfiles'), { recursive: true });
    const cv = await loadContent(tmp, deps());
    expect(cv.dotfiles).toEqual([]);
  });
});
