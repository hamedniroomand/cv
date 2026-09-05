const CLEAR_MS = 1500;

export function useStatusMessage() {
  const message = ref('');
  let timer: ReturnType<typeof setTimeout> | undefined;

  function announce(text: string): void {
    message.value = text;
    clearTimeout(timer);
    timer = setTimeout(() => {
      message.value = '';
    }, CLEAR_MS);
  }

  onBeforeUnmount(() => clearTimeout(timer));

  return { message: readonly(message), announce };
}
