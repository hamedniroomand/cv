import type { View } from './types'
import type { LineSink } from '~/terminal/io/writer'
import { LineWriter } from '~/terminal/io/writer'

export function createPrinter(sink: LineSink, nextId: () => number): View['print'] {
  return (spans, style) => {
    const writer = new LineWriter(sink, nextId, style)
    if (spans.length === 0)
      writer.line()
    else if (typeof spans === 'string')
      writer.write(spans)
    else
      writer.raw(spans)
    writer.flush()
  }
}
