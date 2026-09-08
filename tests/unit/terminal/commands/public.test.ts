import { expect, it } from 'vite-plus/test';

import { commands } from '~/terminal/commands';
import { publicCommands } from '~/terminal/public-commands';
import { makeShell } from '~~/tests/unit/fixtures/context';

it('public whoami introduces the workshop without the candidate biography', async () => {
  const term = makeShell(publicCommands(commands));
  await term.exec('whoami');
  expect(term.text()).toContain('Hamed Niroomand');
  expect(term.text()).toContain('projects');
  expect(term.text()).not.toContain('Team Lead');
  expect(term.calls.navigate).toEqual([]);
});

it('public command discovery has no résumé or PDF shortcuts', async () => {
  const term = makeShell(publicCommands(commands));
  await term.exec('help open');
  expect(term.text()).not.toContain('pdf');
  expect(term.completion.registry.get('cv')).toBeUndefined();
  await term.exec('open pdf');
  expect(term.calls.downloads).toEqual([]);
});
