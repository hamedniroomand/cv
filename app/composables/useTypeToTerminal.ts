interface TypeToTerminalOptions {
  enabled: () => boolean;
  insert: (text: string) => void;
}

/** Sends printable keys to the terminal while no interactive element has focus. */
export function useTypeToTerminal(opts: TypeToTerminalOptions): void {
  function onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || !isPrintableKey(event) || targetsInteractiveElement(event))
      return;
    if (!opts.enabled()) return;
    event.preventDefault();
    opts.insert(event.key);
  }

  onMounted(() => window.addEventListener('keydown', onKeydown));
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
}
