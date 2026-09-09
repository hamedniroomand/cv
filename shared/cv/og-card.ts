/**
 * The file name of a link preview card.
 * The résumé card keeps the plain name, because other sites already point at it.
 * The build script writes these files and the pages point at them, so both use this function.
 */
export function ogCardFile(card: string): string {
  return card === 'resume' ? 'og.png' : `og-${card}.png`;
}
