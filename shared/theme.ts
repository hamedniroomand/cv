export const THEMES = ['dark', 'light', 'gruvbox', 'dracula', 'crt'] as const;
export type ThemeName = (typeof THEMES)[number];
export const THEME_STORAGE_KEY = 'cv:theme';

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}
