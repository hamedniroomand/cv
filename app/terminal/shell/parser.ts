import { ShellSyntaxError } from './errors'
import { tokenize } from './tokenizer'

export interface Segment {
  argv: string[]
  /** The segment was prefixed with `sudo`. There is no `sudo` command; it only sets a flag. */
  sudo: boolean
}

export interface Pipeline {
  segments: Segment[]
}

/** Parse a command line into a pipeline of simple commands. */
export function parse(input: string): Pipeline {
  const tokens = tokenize(input)
  if (tokens.length === 0)
    return { segments: [] }

  const groups: string[][] = [[]]
  for (const token of tokens) {
    if (token.type === 'pipe') {
      if (groups[groups.length - 1]!.length === 0)
        throw new ShellSyntaxError('syntax error near unexpected token `|\'')
      groups.push([])
    }
    else {
      groups[groups.length - 1]!.push(token.value)
    }
  }
  if (groups[groups.length - 1]!.length === 0)
    throw new ShellSyntaxError('syntax error near unexpected token `|\'')

  return {
    segments: groups.map((words) => {
      let sudo = false
      while (words[0] === 'sudo') {
        sudo = true
        words.shift()
      }
      return { argv: words, sudo }
    }),
  }
}
