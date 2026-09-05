import { describe, expect, it } from 'vite-plus/test';

import { commands } from '~/terminal/commands';

const PHASE_1 = [
  'help',
  'ls',
  'cd',
  'pwd',
  'cat',
  'tree',
  'grep',
  'head',
  'tail',
  'echo',
  'clear',
  'history',
  'whoami',
  'date',
  'man',
  'open',
  'cv',
  'contact',
  'skills',
];

describe('command registry glob', () => {
  it('includes every phase 1 command', () => {
    const names = commands.map(c => c.name);
    for (const name of PHASE_1) expect(names).toContain(name);
  });

  it('has unique names and aliases', () => {
    const keys = commands.flatMap(c => [c.name, ...(c.aliases ?? [])]);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every command documents itself', () => {
    for (const c of commands) {
      expect(c.description.length, c.name).toBeGreaterThan(0);
      expect(c.usage.length, c.name).toBeGreaterThan(0);
    }
  });
});
