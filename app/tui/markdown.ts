import type { View } from './types'
import { renderMarkdown } from '~/terminal/io/markdown'

export function printMarkdown(view: View, source: string): void {
  for (const spans of renderMarkdown(source))
    view.print(spans)
}
