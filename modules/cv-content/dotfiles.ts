import { join } from 'node:path';

import { splitDotfilePath } from '#shared/cv/dotfiles';
import { RESERVED_HOME_NAMES } from '#shared/cv/home-names';
import { gistUrl } from '#shared/cv/links';
import type { Dotfile } from '#shared/schemas/dotfile';
import { DotfileFrontmatter } from '#shared/schemas/dotfile';

import { ContentError } from './errors.ts';
import type { GistFetcher } from './github.ts';
import type { Highlighter } from './highlight.ts';
import { byOrder, listMarkdown, readMarkdown, slugOf, validate } from './read.ts';

export interface DotfileDeps {
  fetchGist: GistFetcher;
  highlight: Highlighter;
}

type Loaded = Dotfile & { file: string };

function homeEntry(path: string): string {
  const { dirs, name } = splitDotfilePath(path);
  return dirs[0] ?? name;
}

function assertPaths(dotfiles: Loaded[]): void {
  const seen = new Map<string, string>();
  for (const { path, file } of dotfiles) {
    const entry = homeEntry(path);
    if (RESERVED_HOME_NAMES.includes(entry))
      throw new ContentError(file, `path ${path} uses the reserved home entry ${entry}`);
    const other = seen.get(path);
    if (other) throw new ContentError(file, `duplicate path ${path} (also used by ${other})`);
    seen.set(path, file);
  }
}

async function loadDotfile(file: string, owner: string, deps: DotfileDeps): Promise<Loaded> {
  const { data, body } = await readMarkdown(file);
  const frontmatter = validate(DotfileFrontmatter, data, file);
  if (!body) throw new ContentError(file, 'dotfile body must not be empty');
  const { gist } = frontmatter;
  const remote = gist ? await deps.fetchGist(gist.id, gist.file) : null;
  const content = remote ?? body;
  return {
    ...frontmatter,
    slug: slugOf(file.slice(file.lastIndexOf('/') + 1)),
    content,
    html: deps.highlight(content, frontmatter.lang, file),
    source: remote ? 'gist' : 'inline',
    ...(gist ? { gistUrl: gistUrl(owner, gist.id) } : {}),
    file,
  };
}

export async function loadDotfiles(
  dir: string,
  owner: string,
  deps: DotfileDeps,
): Promise<Dotfile[]> {
  const loaded: Loaded[] = [];
  for (const name of await listMarkdown(dir))
    loaded.push(await loadDotfile(join(dir, name), owner, deps));
  assertPaths(loaded);
  return loaded.sort(byOrder).map(({ file: _file, ...dotfile }) => dotfile);
}
