import { ShellSyntaxError } from './errors'

export type Token = { type: 'word', value: string } | { type: 'pipe' }

type Quote = '"' | '\''

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let word = ''
  let inWord = false
  let quote: Quote | null = null

  const endWord = (): void => {
    if (inWord)
      tokens.push({ type: 'word', value: word })
    word = ''
    inWord = false
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!
    const next = input[i + 1]
    if (quote === '\'') {
      if (ch === '\'')
        quote = null
      else
        word += ch
      continue
    }
    if (quote === '"') {
      if (ch === '"')
        quote = null
      else if (ch === '\\' && (next === '"' || next === '\\'))
        word += input[++i]
      else
        word += ch
      continue
    }
    if (ch === '\'' || ch === '"') {
      quote = ch
      inWord = true
      continue
    }
    if (ch === '\\' && next !== undefined) {
      word += input[++i]
      inWord = true
      continue
    }
    if (ch === '|') {
      endWord()
      tokens.push({ type: 'pipe' })
      continue
    }
    if (/\s/.test(ch)) {
      endWord()
      continue
    }
    word += ch
    inWord = true
  }

  if (quote)
    throw new ShellSyntaxError(`unterminated quote: ${quote}`)
  endWord()
  return tokens
}
