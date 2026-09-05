export function useMediaQuery(query: string, fallback = false) {
  const matches = ref(fallback);
  if (import.meta.client) {
    const media = window.matchMedia(query);
    matches.value = media.matches;
    const onChange = (event: MediaQueryListEvent): void => {
      matches.value = event.matches;
    };
    media.addEventListener('change', onChange);
    onScopeDispose(() => media.removeEventListener('change', onChange));
  }
  return matches;
}
