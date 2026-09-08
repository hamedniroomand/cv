/** The key that opens and closes the terminal. Use it with the Control key. */
export const TERMINAL_HOTKEY = '`';

interface TerminalHotkeyHandlers {
  toggle: () => void;
  close: () => void;
  isOpen: () => boolean;
}

function blockedByDialog(): boolean {
  return document.querySelector('dialog[open]') !== null;
}

/** Connects Control+` to open or close the terminal, and Escape to close it. */
export function useTerminalHotkeys(handlers: TerminalHotkeyHandlers): void {
  function onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === TERMINAL_HOTKEY) {
      event.preventDefault();
      handlers.toggle();
      return;
    }
    if (event.key !== 'Escape') return;
    if (!handlers.isOpen() || event.defaultPrevented || blockedByDialog()) return;
    handlers.close();
  }

  onMounted(() => window.addEventListener('keydown', onKeydown));
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
}
