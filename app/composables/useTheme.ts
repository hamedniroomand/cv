import type { ThemeName } from '#shared/theme';
import { isThemeName, THEME_STORAGE_KEY } from '#shared/theme';

export function useTheme() {
  const theme = useState<ThemeName>('theme', () => 'dark');

  if (import.meta.client) {
    const current = document.documentElement.dataset.theme;
    if (isThemeName(current)) theme.value = current;
  }

  function set(name: ThemeName): void {
    theme.value = name;
    if (!import.meta.client) return;
    document.documentElement.dataset.theme = name;
    writeStorage(THEME_STORAGE_KEY, name);
  }

  return { theme: readonly(theme), set };
}
