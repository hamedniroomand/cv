import { describe, expect, it } from 'vite-plus/test';

import { projectStory } from '#shared/public-site';

describe('projectStory', () => {
  it('returns the written story for a known project', () => {
    const story = projectStory({ slug: 'cue', tagline: 'x' });
    expect(story.headline).toBe('From an issue to a reviewed pull request.');
    expect(story.sections.length).toBeGreaterThan(0);
  });

  it('falls back to the tagline for an unknown project', () => {
    expect(projectStory({ slug: 'none', tagline: 'A tool.' })).toEqual({
      category: 'Project',
      headline: 'A tool.',
      introduction: 'A tool.',
      sections: [],
    });
  });
});
