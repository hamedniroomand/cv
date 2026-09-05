import { describe, expect, it } from 'vite-plus/test';

import { DOTFILES_INDEX, dotfilePath, panelRoute, panelTargetId } from '#shared/cv/panel-target';

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

describe('dotfile targets', () => {
  it('prefixes dotfile slugs', () => {
    expect(panelTargetId({ section: 'dotfiles', slug: 'vscode-settings' })).toBe(
      'dotfile-vscode-settings',
    );
    expect(panelTargetId({ section: 'dotfiles' })).toBe('section-dotfiles');
  });

  it('routes dotfile targets to their pages and everything else home', () => {
    expect(dotfilePath('vscode-settings')).toBe('/dotfiles/vscode-settings');
    expect(DOTFILES_INDEX).toBe('/dotfiles');
    expect(panelRoute({ section: 'dotfiles', slug: 'vscode-settings' })).toBe(
      '/dotfiles/vscode-settings',
    );
    expect(panelRoute({ section: 'dotfiles' })).toBe('/dotfiles');
    expect(panelRoute({ section: 'about' })).toBe('/');
    expect(panelRoute({ section: 'experience', slug: 'acme' })).toBe('/');
  });
});
