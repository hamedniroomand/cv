export type JqNode
  = | { type: 'identity' }
    | { type: 'field', name: string }
    | { type: 'iterate' }
    | { type: 'index', index: number }
    | { type: 'keys' }
    | { type: 'pipe', left: JqNode, right: JqNode }

export class JqSyntaxError extends Error {}

type TokenType = 'dot' | 'identifier' | 'leftBracket' | 'rightBracket' | 'integer' | 'pipe' | 'unknown' | 'eof'

interface Token {
  type: TokenType
  text: string
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let offset = 0

  while (offset < expr.length) {
    const rest = expr.slice(offset)
    const whitespace = rest.match(/^\s+/)
    if (whitespace) {
      offset += whitespace[0].length
      continue
    }

    const ch = expr[offset]!
    const simple: Partial<Record<string, TokenType>> = {
      '.': 'dot',
      '[': 'leftBracket',
      ']': 'rightBracket',
      '|': 'pipe',
    }
    const type = simple[ch]
    if (type) {
      tokens.push({ type, text: ch })
      offset++
      continue
    }

    const integer = rest.match(/^\d+/)
    if (integer) {
      tokens.push({ type: 'integer', text: integer[0] })
      offset += integer[0].length
      continue
    }

    const identifier = rest.match(/^[A-Z_][\w-]*/i)
    if (identifier) {
      tokens.push({ type: 'identifier', text: identifier[0] })
      offset += identifier[0].length
      continue
    }

    tokens.push({ type: 'unknown', text: ch })
    offset++
  }

  tokens.push({ type: 'eof', text: 'end of input' })
  return tokens
}

class Parser {
  private offset = 0

  constructor(private readonly tokens: Token[]) {}

  parse(): JqNode {
    if (this.peek().type === 'eof')
      this.fail(this.peek())

    let node = this.term()
    while (this.match('pipe'))
      node = { type: 'pipe', left: node, right: this.term() }

    if (this.peek().type !== 'eof')
      this.fail(this.peek())
    return node
  }

  private term(): JqNode {
    const token = this.peek()
    if (token.type === 'identifier' && token.text === 'keys') {
      this.offset++
      return { type: 'keys' }
    }
    if (!this.match('dot'))
      this.fail(token)

    let node: JqNode = { type: 'identity' }
    let hasPath = false
    while (true) {
      const next = this.peek()
      let path: JqNode
      if (next.type === 'identifier') {
        this.offset++
        path = { type: 'field', name: next.text }
      }
      else if (next.type === 'leftBracket') {
        path = this.bracket()
      }
      else if (next.type === 'dot') {
        this.offset++
        const field = this.peek()
        if (field.type !== 'identifier')
          this.fail(field)
        this.offset++
        path = { type: 'field', name: field.text }
      }
      else {
        break
      }
      node = hasPath ? { type: 'pipe', left: node, right: path } : path
      hasPath = true
    }
    return node
  }

  private bracket(): JqNode {
    const opening = this.peek()
    this.offset++
    if (this.match('rightBracket'))
      return { type: 'iterate' }

    const integer = this.peek()
    if (integer.type !== 'integer')
      this.fail(opening)
    this.offset++
    if (!this.match('rightBracket'))
      this.fail(opening)
    return { type: 'index', index: Number.parseInt(integer.text, 10) }
  }

  private peek(): Token {
    return this.tokens[this.offset]!
  }

  private match(type: TokenType): boolean {
    if (this.peek().type !== type)
      return false
    this.offset++
    return true
  }

  private fail(token: Token): never {
    throw new JqSyntaxError(`Unexpected token "${token.text}"`)
  }
}

export function parseJq(expr: string): JqNode {
  return new Parser(tokenize(expr)).parse()
}
