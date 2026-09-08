/** The modes of the terminal window on the public site. */
export type TerminalWindowMode = 'closed' | 'minimized' | 'normal' | 'maximized';

/** A mode that shows the terminal. The window goes back to this mode after you minimize it. */
export type TerminalWindowSize = Extract<TerminalWindowMode, 'normal' | 'maximized'>;

export type TerminalWindowAction =
  | 'open'
  | 'close'
  | 'minimize'
  | 'maximize'
  | 'restore'
  | 'toggle'
  | 'toggleMaximize';

export interface TerminalWindowState {
  mode: TerminalWindowMode;
  /** The mode to use when the window opens again. */
  size: TerminalWindowSize;
}

export const INITIAL_WINDOW_STATE: TerminalWindowState = { mode: 'closed', size: 'normal' };

/** True when the window shows the terminal. A minimized window shows only its bar. */
export function isDocked(mode: TerminalWindowMode): mode is TerminalWindowSize {
  return mode === 'normal' || mode === 'maximized';
}

function sized(size: TerminalWindowSize): TerminalWindowState {
  return { mode: size, size };
}

export function reduce(
  state: TerminalWindowState,
  action: TerminalWindowAction,
): TerminalWindowState {
  switch (action) {
    case 'open':
      return sized(state.mode === 'minimized' ? state.size : 'normal');
    case 'close':
      return INITIAL_WINDOW_STATE;
    case 'minimize':
      return { mode: 'minimized', size: isDocked(state.mode) ? state.mode : state.size };
    case 'maximize':
      return sized('maximized');
    case 'restore':
      return sized('normal');
    case 'toggle':
      return isDocked(state.mode) ? INITIAL_WINDOW_STATE : reduce(state, 'open');
    case 'toggleMaximize':
      return sized(state.mode === 'maximized' ? 'normal' : 'maximized');
  }
  // Every action has a case above. This guard fails the build if a new action has none.
  const unhandled: never = action;
  throw new Error(`unknown terminal window action: ${String(unhandled)}`);
}
