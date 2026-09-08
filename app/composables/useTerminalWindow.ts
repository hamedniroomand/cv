import type { TerminalWindowAction } from '#shared/terminal/window-mode';
import { INITIAL_WINDOW_STATE, isDocked, reduce } from '#shared/terminal/window-mode';

/**
 * Keeps the mode of the public terminal window.
 * The rules that change the mode are in `#shared/terminal/window-mode`.
 */
export function useTerminalWindow() {
  const state = useState('terminal-window', () => INITIAL_WINDOW_STATE);
  /** Stays false until the first open, because the terminal is a large bundle. */
  const loaded = useState('terminal-window-loaded', () => false);

  function dispatch(action: TerminalWindowAction): void {
    state.value = reduce(state.value, action);
    if (state.value.mode !== 'closed') loaded.value = true;
  }

  return {
    mode: computed(() => state.value.mode),
    docked: computed(() => isDocked(state.value.mode)),
    minimized: computed(() => state.value.mode === 'minimized'),
    maximized: computed(() => state.value.mode === 'maximized'),
    present: computed(() => state.value.mode !== 'closed'),
    loaded: readonly(loaded),
    dispatch,
  };
}
