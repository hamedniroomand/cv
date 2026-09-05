export function useClipboard() {
  const { statusMs } = useAppConfig().feedback;
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(text: string): Promise<boolean> {
    if (!import.meta.client || !navigator.clipboard?.writeText) return false;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return false;
    }
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
    }, statusMs);
    return true;
  }

  onBeforeUnmount(() => clearTimeout(timer));

  return { copy, copied: readonly(copied) };
}
