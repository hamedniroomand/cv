import { ShellSyntaxError } from './errors';
import { tokenize } from './tokenizer';

export interface Segment {
  argv: string[];
  sudo: boolean;
}

export interface Pipeline {
  segments: Segment[];
}

const UNEXPECTED_PIPE = "syntax error near unexpected token `|'";

function toSegment(words: string[]): Segment {
  let sudo = false;
  while (words[0] === 'sudo') {
    sudo = true;
    words.shift();
  }
  return { argv: words, sudo };
}

export function parse(input: string): Pipeline {
  const tokens = tokenize(input);
  if (tokens.length === 0) return { segments: [] };

  const groups: string[][] = [[]];
  for (const token of tokens) {
    const current = groups[groups.length - 1]!;
    if (token.type === 'word') {
      current.push(token.value);
      continue;
    }
    if (current.length === 0) throw new ShellSyntaxError(UNEXPECTED_PIPE);
    groups.push([]);
  }
  if (groups[groups.length - 1]!.length === 0) throw new ShellSyntaxError(UNEXPECTED_PIPE);

  return { segments: groups.map(toSegment) };
}
