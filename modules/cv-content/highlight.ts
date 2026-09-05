import { codeToHtml } from 'rangi';
import { languages } from 'rangi/languages';

import { ContentError } from './errors.ts';

export type Highlighter = (code: string, lang: string, file: string) => string;

/** The `languages` map of rangi includes the aliases, for example `jsonc` and `zsh`. */
export function isKnownLanguage(lang: string): boolean {
  return Object.hasOwn(languages, lang);
}

/**
 * Highlights code into markup with `shj-*` classes and no inline styles.
 * rangi does not reject an unknown language. This function rejects it, so that the build fails.
 */
export const highlight: Highlighter = (code, lang, file) => {
  if (!isKnownLanguage(lang)) throw new ContentError(file, `unknown lang "${lang}"`);
  return codeToHtml(code, { lang, classes: true });
};
