import type { JqNode } from './parse'

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

export class JqRuntimeError extends Error {}

function typeName(value: Json): string {
  if (value === null)
    return 'null'
  if (Array.isArray(value))
    return 'array'
  return typeof value
}

function evaluate(node: JqNode, input: Json): Json[] {
  switch (node.type) {
    case 'identity':
      return [input]
    case 'field':
      if (input === null)
        return [null]
      if (Array.isArray(input) || typeof input !== 'object')
        throw new JqRuntimeError(`Cannot index ${typeName(input)} with "${node.name}"`)
      return [input[node.name] ?? null]
    case 'iterate':
      if (Array.isArray(input))
        return input
      if (input !== null && typeof input === 'object')
        return Object.values(input)
      throw new JqRuntimeError(`Cannot iterate over ${typeName(input)}`)
    case 'index':
      if (!Array.isArray(input))
        throw new JqRuntimeError(`Cannot index ${typeName(input)} with number`)
      return [input[node.index] ?? null]
    case 'keys':
      if (Array.isArray(input))
        return [input.map((_, index) => index)]
      if (input !== null && typeof input === 'object')
        return [Object.keys(input).sort()]
      throw new JqRuntimeError(`${typeName(input)} has no keys`)
    case 'pipe':
      return evaluate(node.left, input).flatMap(value => evaluate(node.right, value))
  }
}

export function evalJq(node: JqNode, input: Json): Json[] {
  return evaluate(node, input)
}

export function formatJson(value: Json, opts: { raw?: boolean, compact?: boolean } = {}): string {
  if (opts.raw && typeof value === 'string')
    return value
  return JSON.stringify(value, null, opts.compact ? undefined : 2)
}
