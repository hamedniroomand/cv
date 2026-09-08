import { expect, it } from 'vite-plus/test';

import type { TerminalWindowState } from '#shared/terminal/window-mode';
import { INITIAL_WINDOW_STATE, isDocked, reduce } from '#shared/terminal/window-mode';

const after = (state: TerminalWindowState, ...actions: Parameters<typeof reduce>[1][]) =>
  actions.reduce(reduce, state);

it('starts closed', () => {
  expect(INITIAL_WINDOW_STATE.mode).toBe('closed');
  expect(isDocked(INITIAL_WINDOW_STATE.mode)).toBe(false);
});

it('opens to the normal size', () => {
  expect(after(INITIAL_WINDOW_STATE, 'open').mode).toBe('normal');
});

it('returns a minimized window to the size it had before', () => {
  const maximized = after(INITIAL_WINDOW_STATE, 'open', 'maximize');
  const minimized = reduce(maximized, 'minimize');
  expect(minimized.mode).toBe('minimized');
  expect(reduce(minimized, 'open').mode).toBe('maximized');
});

it('swaps between the maximized and the normal size', () => {
  const normal = after(INITIAL_WINDOW_STATE, 'open');
  const maximized = reduce(normal, 'toggleMaximize');
  expect(maximized.mode).toBe('maximized');
  expect(reduce(maximized, 'toggleMaximize').mode).toBe('normal');
});

it('opens a closed window when you toggle it, and closes an open window', () => {
  const opened = reduce(INITIAL_WINDOW_STATE, 'toggle');
  expect(opened.mode).toBe('normal');
  expect(reduce(opened, 'toggle').mode).toBe('closed');
});

it('opens a minimized window when you toggle it', () => {
  const minimized = after(INITIAL_WINDOW_STATE, 'open', 'minimize');
  expect(reduce(minimized, 'toggle').mode).toBe('normal');
});

it('forgets the previous size when the window closes', () => {
  const closed = after(INITIAL_WINDOW_STATE, 'open', 'maximize', 'close');
  expect(closed.mode).toBe('closed');
  expect(reduce(closed, 'open').mode).toBe('normal');
});

it('counts only the normal and the maximized modes as docked', () => {
  expect(isDocked('normal')).toBe(true);
  expect(isDocked('maximized')).toBe(true);
  expect(isDocked('minimized')).toBe(false);
  expect(isDocked('closed')).toBe(false);
});
