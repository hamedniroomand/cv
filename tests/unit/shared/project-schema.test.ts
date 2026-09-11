import { describe, expect, it } from 'vite-plus/test';

import { ProjectFrontmatter } from '#shared/schemas/project';

const base = { name: 'Cue', order: 1, tagline: 'Drive agents.', stack: ['TypeScript'] };

describe('ProjectFrontmatter', () => {
  it('accepts a public repo without a site', () => {
    const value = { ...base, repo: 'hamedniroomand/cue' };
    expect(ProjectFrontmatter.parse(value)).toEqual(value);
  });

  it('accepts a hosted site without a repo', () => {
    const value = { ...base, site: 'https://kitdev.space' };
    expect(ProjectFrontmatter.parse(value)).toEqual(value);
  });

  it('rejects an entry with neither repo nor site', () => {
    expect(() => ProjectFrontmatter.parse(base)).toThrow(/repo or site/);
  });

  it('rejects a malformed repo handle', () => {
    expect(() => ProjectFrontmatter.parse({ ...base, repo: 'not a handle' })).toThrow(
      /regex|invalid/i,
    );
  });
});
