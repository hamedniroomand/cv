import type { OutputLine } from '~/terminal/types'

export function lineText(line: OutputLine): string {
  return line.spans.map(span => span.text).join('')
}

export function texts(lines: OutputLine[]): string[] {
  return lines.map(lineText)
}

export function joinLines(lines: OutputLine[]): string {
  return texts(lines).join('\n')
}
