import type { JqNode } from './parse';

type JsonObject = { [k: string]: Json };
export type Json = null | boolean | number | string | Json[] | JsonObject;

type Evaluator<T extends JqNode['type']> = (
  node: Extract<JqNode, { type: T }>,
  input: Json,
) => Json[];

export class JqRuntimeError extends Error {}

function typeName(value: Json): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function isObject(value: Json): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const EVALUATORS: { [T in JqNode['type']]: Evaluator<T> } = {
  identity: (_node, input) => [input],
  field(node, input) {
    if (input === null) return [null];
    if (!isObject(input))
      throw new JqRuntimeError(`Cannot index ${typeName(input)} with "${node.name}"`);
    return [input[node.name] ?? null];
  },
  iterate(_node, input) {
    if (Array.isArray(input)) return input;
    if (isObject(input)) return Object.values(input);
    throw new JqRuntimeError(`Cannot iterate over ${typeName(input)}`);
  },
  index(node, input) {
    if (!Array.isArray(input))
      throw new JqRuntimeError(`Cannot index ${typeName(input)} with number`);
    return [input[node.index] ?? null];
  },
  keys(_node, input) {
    if (Array.isArray(input)) return [input.map((_, index) => index)];
    if (isObject(input)) return [Object.keys(input).sort()];
    throw new JqRuntimeError(`${typeName(input)} has no keys`);
  },
  pipe: (node, input) => evalJq(node.left, input).flatMap(value => evalJq(node.right, value)),
};

export function evalJq(node: JqNode, input: Json): Json[] {
  return (EVALUATORS[node.type] as Evaluator<JqNode['type']>)(node, input);
}

export function formatJson(value: Json, opts: { raw?: boolean; compact?: boolean } = {}): string {
  if (opts.raw && typeof value === 'string') return value;
  return JSON.stringify(value, null, opts.compact ? undefined : 2);
}
