import type { Ref } from 'vue';

export function useTurnstile(el: Ref<HTMLElement | null>, siteKey: string, token: Ref<string>) {
  let widgetId: string | undefined;

  function clearToken(): void {
    token.value = '';
  }

  onMounted(async () => {
    const api = await loadTurnstile().catch(() => null);
    if (!api || !el.value) return;
    widgetId = api.render(el.value, {
      sitekey: siteKey,
      theme: turnstileTheme(),
      size: 'flexible',
      callback: (value: string) => {
        token.value = value;
      },
      'expired-callback': clearToken,
      'error-callback': clearToken,
    });
  });

  onBeforeUnmount(() => {
    if (widgetId) window.turnstile?.remove(widgetId);
  });

  function reset(): void {
    clearToken();
    if (widgetId) window.turnstile?.reset(widgetId);
  }

  return { reset };
}
