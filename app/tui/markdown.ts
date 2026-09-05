import { renderMarkdown } from '~/terminal/io/markdown';

import type { View } from './types';

export function printMarkdown(view: View, source: string): void {
  for (const spans of renderMarkdown(source)) view.print(spans);
}
