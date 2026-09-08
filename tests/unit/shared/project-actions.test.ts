import { expect, it } from 'vite-plus/test';

import { projectActions } from '#shared/cv/project-actions';

const base = { name: 'Cue' };

it('makes the live site the primary action and the repository the secondary one', () => {
  const actions = projectActions({ ...base, site: 'https://kitdev.space', repo: 'me/kitdev' });
  expect(actions.map(action => [action.kind, action.variant])).toEqual([
    ['site', 'primary'],
    ['repo', 'secondary'],
  ]);
});

it('promotes the documentation when a project has no live site', () => {
  const actions = projectActions({ ...base, docs: 'https://docs.test', repo: 'me/cue' });
  expect(actions.map(action => [action.kind, action.variant])).toEqual([
    ['docs', 'primary'],
    ['repo', 'secondary'],
  ]);
});

it('keeps one primary action when a project has both a site and documentation', () => {
  const actions = projectActions({
    ...base,
    site: 'https://kitdev.space',
    docs: 'https://docs.test',
    repo: 'me/kitdev',
  });
  expect(actions.filter(action => action.variant === 'primary')).toHaveLength(1);
  expect(actions.map(action => action.kind)).toEqual(['site', 'docs', 'repo']);
});

it('builds the repository link from the handle', () => {
  const [action] = projectActions({ ...base, repo: 'hamedniroomand/cue' });
  expect(action).toMatchObject({
    kind: 'repo',
    href: 'https://github.com/hamedniroomand/cue',
    variant: 'primary',
  });
});

it('names the site action after the project', () => {
  const [action] = projectActions({ name: 'KitDev Space', site: 'https://kitdev.space' });
  expect(action!.label).toBe('Visit KitDev Space');
});
