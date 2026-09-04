import type { ThemeName } from '~/terminal/types'

export const THEMES: readonly ThemeName[] = ['dark', 'light', 'gruvbox', 'dracula', 'crt']
export const THEME_STORAGE_KEY = 'cv:theme'

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

/**
 * Current theme. The pre-paint script in nuxt.config applies the stored choice before hydration;
 * this composable mirrors it into state and persists changes.
 */
export function useTheme() {
  const theme = useState<ThemeName>('theme', () => 'dark')

  if (import.meta.client) {
    const current = document.documentElement.dataset.theme
    if (isThemeName(current))
      theme.value = current
  }

  function set(name: ThemeName): void {
    theme.value = name
    if (!import.meta.client)
      return
    document.documentElement.dataset.theme = name
    try {
      localStorage.setItem(THEME_STORAGE_KEY, name)
    }
    catch {
      // Storage may be unavailable (private mode); the attribute still applies for this visit.
    }
  }

  return { theme: readonly(theme), set }
}
