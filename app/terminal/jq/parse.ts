export type JqNode =
  | { type: 'identity' }
  | { type: 'field'; name: string }
  | { type: 'iterate' }
  | { type: 'index'; index: number }
  | { type: 'keys' }
  | { type: 'pipe'; left: JqNode; right: JqNode };

export class JqSyntaxError extends Error {}

type TokenType =
  | 'dot'
  | 'identifier'
  | 'leftBracket'
  | 'rightBracket'
  | 'integer'
  | 'pipe'
  | 'unknown'
  | 'eof';

interface Token {
  type: TokenType;
  text: string;
}

const SINGLE_CHAR_TOKENS: Partial<Record<string, TokenType>> = {
  '.': 'dot',
  '[': 'leftBracket',
  ']': 'rightBracket',
  '|': 'pipe',
};

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let offset = 0;

  while (offset < expr.length) {
    const rest = expr.slice(offset);
    const whitespace = rest.match(/^\s+/);
    if (whitespace) {
      offset += whitespace[0].length;
      continue;
    }

    const ch = expr[offset]!;
    const single = SINGLE_CHAR_TOKENS[ch];
    if (single) {
      tokens.push({ type: single, text: ch });
      offset++;
      continue;
    }

    const integer = rest.match(/^\d+/);
    if (integer) {
      tokens.push({ type: 'integer', text: integer[0] });
      offset += integer[0].length;
      continue;
    }

    const identifier = rest.match(/^[A-Z_][\w-]*/i);
    if (identifier) {
      tokens.push({ type: 'identifier', text: identifier[0] });
      offset += identifier[0].length;
      continue;
    }

    tokens.push({ type: 'unknown', text: ch });
    offset++;
  }

  tokens.push({ type: 'eof', text: 'end of input' });
  return tokens;
}

class Parser {
  private offset = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): JqNode {
    if (this.peek().type === 'eof') this.fail(this.peek());

    let node = this.term();
    while (this.match('pipe')) node = { type: 'pipe', left: node, right: this.term() };

    if (this.peek().type !== 'eof') this.fail(this.peek());
    return node;
  }

  private term(): JqNode {
    const token = this.peek();
    if (token.type === 'identifier' && token.text === 'keys') {
      this.offset++;
      return { type: 'keys' };
    }
    if (!this.match('dot')) this.fail(token);

    let node: JqNode = { type: 'identity' };
    let hasPath = false;
    for (let path = this.pathStep(); path; path = this.pathStep()) {
      node = hasPath ? { type: 'pipe', left: node, right: path } : path;
      hasPath = true;
    }
    return node;
  }

  private pathStep(): JqNode | null {
    const next = this.peek();
    if (next.type === 'identifier') {
      this.offset++;
      return { type: 'field', name: next.text };
    }
    if (next.type === 'leftBracket') return this.bracket();
    if (next.type === 'dot') {
      this.offset++;
      return { type: 'field', name: this.expect('identifier').text };
    }
    return null;
  }

  private bracket(): JqNode {
    this.offset++;
    if (this.match('rightBracket')) return { type: 'iterate' };
    const integer = this.expect('integer');
    this.expect('rightBracket');
    return { type: 'index', index: Number.parseInt(integer.text, 10) };
  }

  private peek(): Token {
    return this.tokens[this.offset]!;
  }

  private match(type: TokenType): boolean {
    if (this.peek().type !== type) return false;
    this.offset++;
    return true;
  }

  private expect(type: TokenType): Token {
    const token = this.peek();
    if (token.type !== type) this.fail(token);
    this.offset++;
    return token;
  }

  private fail(token: Token): never {
    throw new JqSyntaxError(`Unexpected token "${token.text}"`);
  }
}

export function parseJq(expr: string): JqNode {
  return new Parser(tokenize(expr)).parse();
}
