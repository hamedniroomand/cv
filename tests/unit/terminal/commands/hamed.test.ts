import { describe, expect, it } from 'vite-plus/test';

import { commands } from '~/terminal/commands';
import { makeShell } from '~~/tests/unit/fixtures/context';

describe('hamed', () => {
  it.each(['hamed', 'app', 'tui'])('%s opens app mode and reports exit', async name => {
    const app = makeShell(commands);

    const result = await app.exec(name);

    expect(result.code).toBe(0);
    expect(app.calls.apps).toBe(1);
    expect(app.text()).toBe('hamed: exited');
  });

  it('reports exit only after app mode closes', async () => {
    const app = makeShell(commands);
    let closeApp!: () => void;
    const closed = new Promise<void>(resolve => {
      closeApp = resolve;
    });
    app.deps.ui.openApp = () => closed;

    const execution = app.exec('hamed');
    await Promise.resolve();
    expect(app.text()).toBe('');

    closeApp();
    expect((await execution).code).toBe(0);
    expect(app.text()).toBe('hamed: exited');
  });

  it('surfaces unavailable app UI without reporting a successful exit', async () => {
    const app = makeShell(commands);
    app.deps.ui.openApp = async () => {
      throw new Error('interactive app UI is not mounted');
    };

    expect((await app.exec('hamed')).code).toBe(1);
    expect(app.text()).toBe('hamed: interactive app UI is not mounted');
    expect(app.text()).not.toContain('hamed: exited');
  });
});
