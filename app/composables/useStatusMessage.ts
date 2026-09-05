export function useStatusMessage() {
  const { statusMs } = useAppConfig().feedback;
  const message = ref('');
  let timer: ReturnType<typeof setTimeout> | undefined;

  function announce(text: string): void {
    message.value = text;
    clearTimeout(timer);
    timer = setTimeout(() => {
      message.value = '';
    }, statusMs);
  }

  onBeforeUnmount(() => clearTimeout(timer));

  return { message: readonly(message), announce };
}
