import { describe, expect, it } from 'vite-plus/test';

import {
  DOTFILES_INDEX,
  dotfilePath,
  panelRoute,
  panelTargetId,
  publicNavigation,
  publicPanelRoute,
} from '#shared/cv/panel-target';

describe('panelTargetId', () => {
  it('uses the section name as the id by default', () => {
    expect(panelTargetId({ section: 'about' })).toBe('about');
    expect(panelTargetId({ section: 'top' })).toBe('top');
  });

  it('prefixes experience and project slugs', () => {
    expect(panelTargetId({ section: 'experience', slug: 'acme' })).toBe('exp-acme');
    expect(panelTargetId({ section: 'projects', slug: 'cue' })).toBe('project-cue');
  });

  it('ignores slugs on other sections', () => {
    expect(panelTargetId({ section: 'skills', slug: 'frontend' })).toBe('skills');
  });
});

describe('dotfile targets', () => {
  it('prefixes dotfile slugs', () => {
    expect(panelTargetId({ section: 'dotfiles', slug: 'vscode-settings' })).toBe(
      'dotfile-vscode-settings',
    );
    expect(panelTargetId({ section: 'dotfiles' })).toBe('dotfiles');
  });

  it('routes dotfile targets to their pages and career content to the résumé', () => {
    expect(dotfilePath('vscode-settings')).toBe('/dotfiles/vscode-settings');
    expect(panelRoute({ section: 'projects', slug: 'cue' })).toBe('/projects/cue');
    expect(DOTFILES_INDEX).toBe('/dotfiles');
    expect(panelRoute({ section: 'dotfiles', slug: 'vscode-settings' })).toBe(
      '/dotfiles/vscode-settings',
    );
    expect(panelRoute({ section: 'dotfiles' })).toBe('/dotfiles');
    expect(panelRoute({ section: 'about' })).toBe('/cv');
    expect(panelRoute({ section: 'experience', slug: 'acme' })).toBe('/cv');
  });
});

describe('publicPanelRoute', () => {
  it('opens the page of a target that the public site publishes', () => {
    expect(publicPanelRoute({ section: 'projects', slug: 'cue' })).toBe('/projects/cue');
    expect(publicPanelRoute({ section: 'dotfiles' })).toBe('/dotfiles');
    expect(publicPanelRoute({ section: 'dotfiles', slug: 'vscode-settings' })).toBe(
      '/dotfiles/vscode-settings',
    );
  });

  it('stays on the current page when the target is a home-page section', () => {
    expect(publicPanelRoute({ section: 'top' })).toBeNull();
    expect(publicPanelRoute({ section: 'contact' })).toBeNull();
    expect(publicPanelRoute({ section: 'projects' })).toBeNull();
  });

  it('never sends a visitor to the résumé', () => {
    for (const section of ['about', 'experience', 'skills', 'education'] as const)
      expect(publicPanelRoute({ section })).toBeNull();
    expect(publicPanelRoute({ section: 'experience', slug: 'jack-westin' })).toBeNull();
  });
});

describe('publicNavigation', () => {
  it('opens the page of a target that the visitor is not on', () => {
    expect(publicNavigation({ section: 'projects', slug: 'cue' }, '/')).toBe('/projects/cue');
    expect(publicNavigation({ section: 'dotfiles' }, '/projects/cue')).toBe('/dotfiles');
  });

  it('stays put when the target is the page already open', () => {
    expect(publicNavigation({ section: 'projects', slug: 'cue' }, '/projects/cue')).toBeNull();
    expect(publicNavigation({ section: 'dotfiles' }, '/dotfiles')).toBeNull();
  });

  it('stays put when the public site has no page for the target', () => {
    expect(publicNavigation({ section: 'top' }, '/projects/cue')).toBeNull();
    expect(publicNavigation({ section: 'experience', slug: 'thales' }, '/')).toBeNull();
  });
});
