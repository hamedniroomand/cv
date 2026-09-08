import { expect, it } from 'vite-plus/test';

import { publicExperience } from '#shared/cv/public-experience';
import { fixtureCv } from '~~/tests/unit/fixtures/cv';

it('spans every role in one range and keeps the authored order', () => {
  const [acme, globex] = publicExperience(fixtureCv.experience);
  expect(acme!.company).toBe('Acme');
  expect(acme!.range).toBe('Jan 2022 – Aug 2026');
  expect(globex!.range).toBe('May 2019 – Jul 2021');
});

it('never exposes a role title on the public timeline', () => {
  const text = JSON.stringify(publicExperience(fixtureCv.experience));
  expect(text).not.toContain('Team Lead');
  expect(text).not.toContain('Senior Developer');
});

it('reports an open-ended role as present', () => {
  const [entry] = publicExperience([
    { ...fixtureCv.experience[0]!, roles: [{ title: 'x', start: '2024-01', end: 'present' }] },
  ]);
  expect(entry!.range).toBe('Jan 2024 – Present');
});

it('prefers an authored summary over the body', () => {
  const [entry] = publicExperience([{ ...fixtureCv.experience[0]!, summary: 'A terse line.' }]);
  expect(entry!.summary).toBe('A terse line.');
});

it('falls back to the first sentence of the body', () => {
  const [entry] = publicExperience([
    { ...fixtureCv.experience[0]!, body: 'Acme builds widgets. It also does other things.' },
  ]);
  expect(entry!.summary).toBe('Acme builds widgets.');
});
