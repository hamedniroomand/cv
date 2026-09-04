import type { View } from './types'
import { renderMarkdown } from '~/terminal/io/markdown'

/** Print a markdown document to the app view, one rendered line per `print`. */
export function printMarkdown(view: View, source: string): void {
  for (const spans of renderMarkdown(source))
    view.print(spans)
}
