import { describe, expect, it } from 'vite-plus/test';

import { panelTargetId } from '#shared/cv/panel-target';

describe('panelTargetId', () => {
  it('uses section ids by default', () => {
    expect(panelTargetId({ section: 'about' })).toBe('section-about');
    expect(panelTargetId({ section: 'top' })).toBe('section-top');
  });

  it('prefixes experience and project slugs', () => {
    expect(panelTargetId({ section: 'experience', slug: 'acme' })).toBe('exp-acme');
    expect(panelTargetId({ section: 'projects', slug: 'cue' })).toBe('project-cue');
  });

  it('ignores slugs on other sections', () => {
    expect(panelTargetId({ section: 'skills', slug: 'frontend' })).toBe('section-skills');
  });
});
