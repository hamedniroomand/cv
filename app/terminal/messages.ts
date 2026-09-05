export function unknownValueMessage(
  command: string,
  kind: string,
  value: string,
  options: readonly string[],
): string {
  return `${command}: unknown ${kind} '${value}' (try: ${options.join(', ')})`;
}
