import { describe, expect, it } from 'vite-plus/test';

import { createAppRegistry } from '~/tui/registry';
import { createAppRunner } from '~/tui/runner';
import type { AppCommand, AppContext, View } from '~/tui/types';
import { makeShell } from '~~/tests/unit/fixtures/context';

type BaseAppContext = Omit<
  AppContext,
  'argv0' | 'registry' | 'shell' | 'signal' | 'slash' | 'sudo'
>;

function makeRunner(commands: AppCommand[], shellCode = 7) {
  const errors: string[] = [];
  const shellCalls: Array<{ line: string; signal: AbortSignal }> = [];
  let exits = 0;
  const view: View = {
    print: (value, style) => {
      if (style === 'error')
        errors.push(typeof value === 'string' ? value : value.map(span => span.text).join(''));
    },
    clear: () => {},
    pick: async () => null,
    status: () => {},
    exit: () => exits++,
  };
  const { deps } = makeShell([]);
  const context: BaseAppContext = {
    fs: deps.fs,
    env: deps.env,
    cv: deps.cv,
    panel: deps.panel,
    theme: deps.theme,
    lang: deps.lang,
    history: deps.history,
    ui: deps.ui,
    view,
  };
  const runner = createAppRunner({
    registry: createAppRegistry(commands),
    context,
    shell: async (line, signal) => {
      shellCalls.push({ line, signal });
      return shellCode;
    },
  });
  return { runner, errors, shellCalls, exits: () => exits };
}

describe('createAppRunner', () => {
  it('falls through plain input to the shell callback', async () => {
    const { runner, shellCalls } = makeRunner([]);
    const signal = new AbortController().signal;

    expect(await runner.run('ls -la', signal)).toBe(7);
    expect(shellCalls).toEqual([{ line: 'ls -la', signal }]);
  });

  it('dispatches an exact slash command with parsed arguments', async () => {
    let received: { argv: string[]; signal: AbortSignal } | undefined;
    const command: AppCommand = {
      name: 'experience',
      description: '',
      run: (argv, ctx) => {
        received = { argv, signal: ctx.signal };
        return 4;
      },
    };
    const { runner } = makeRunner([command]);
    const signal = new AbortController().signal;

    expect(await runner.run('/experience acme senior', signal)).toBe(4);
    expect(received).toEqual({ argv: ['acme', 'senior'], signal });
  });

  it('does not fuzzy-dispatch a partial submitted command', async () => {
    const command: AppCommand = {
      name: 'experience',
      description: '',
      run: () => 0,
    };
    const { runner, errors } = makeRunner([command]);

    expect(await runner.run('/exp', new AbortController().signal)).toBe(127);
    expect(errors).toContain('hamed: unknown command /exp — type / to see the list');
  });

  it('reports unknown slash commands without leaving the app', async () => {
    const { runner, errors, exits } = makeRunner([]);

    expect(await runner.run('/wat', new AbortController().signal)).toBe(127);
    expect(errors).toContain('hamed: unknown command /wat — type / to see the list');
    expect(exits()).toBe(0);
  });

  it('catches slash command errors', async () => {
    const command: AppCommand = {
      name: 'boom',
      description: '',
      run: () => {
        throw new Error('exploded');
      },
    };
    const { runner, errors } = makeRunner([command]);

    expect(await runner.run('/boom', new AbortController().signal)).toBe(1);
    expect(errors).toContain('hamed: /boom: exploded');
  });

  it('routes nested shell and slash calls with the same signal and fresh contexts', async () => {
    const contexts: AppContext[] = [];
    const child: AppCommand = {
      name: 'child',
      description: '',
      run: (_argv, ctx) => {
        contexts.push(ctx);
        return 3;
      },
    };
    const parent: AppCommand = {
      name: 'parent',
      description: '',
      run: async (_argv, ctx) => {
        contexts.push(ctx);
        const shellCode = await ctx.shell('echo nested');
        const slashCode = await ctx.slash('/child');
        return shellCode + slashCode;
      },
    };
    const { runner, shellCalls } = makeRunner([parent, child]);
    const signal = new AbortController().signal;

    expect(await runner.run('/parent', signal)).toBe(10);
    expect(shellCalls).toEqual([{ line: 'echo nested', signal }]);
    expect(contexts).toHaveLength(2);
    expect(contexts[0]).not.toBe(contexts[1]);
    expect(contexts.map(ctx => ctx.signal)).toEqual([signal, signal]);
  });
});
