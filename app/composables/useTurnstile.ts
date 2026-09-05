import type { Ref } from 'vue';

export function useTurnstile(el: Ref<HTMLElement | null>, siteKey: string, token: Ref<string>) {
  let widgetId: string | undefined;

  onMounted(async () => {
    let api: TurnstileApi;
    try {
      api = await loadTurnstile();
    } catch {
      return;
    }
    if (!el.value) return;
    widgetId = api.render(el.value, {
      sitekey: siteKey,
      theme: turnstileTheme(),
      size: 'flexible',
      callback: (value: string) => {
        token.value = value;
      },
      'expired-callback': () => {
        token.value = '';
      },
      'error-callback': () => {
        token.value = '';
      },
    });
  });

  onBeforeUnmount(() => {
    if (widgetId) window.turnstile?.remove(widgetId);
  });

  function reset(): void {
    token.value = '';
    if (widgetId) window.turnstile?.reset(widgetId);
  }

  return { reset };
}
