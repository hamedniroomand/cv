export function usePanelReveal() {
  const requested = useState<number>('panel-reveal', () => 0);

  function request(): void {
    requested.value++;
  }

  return { requested: readonly(requested), request };
}
