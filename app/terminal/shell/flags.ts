export interface FlagSpec {
  boolean?: string[]
  string?: string[]
}

export interface ParsedArgs {
  flags: Set<string>
  values: Record<string, string>
  positionals: string[]
  unknown: string[]
}

/**
 * Minimal getopt: `-la`, `-n 3`, `-n3`, `--long`, `--key=value`, `--key value`, `--` terminator.
 * A lone `-` is positional (stdin convention).
 */
export function parseFlags(argv: string[], spec: FlagSpec): ParsedArgs {
  const booleans = new Set(spec.boolean ?? [])
  const strings = new Set(spec.string ?? [])
  const out: ParsedArgs = { flags: new Set(), values: {}, positionals: [], unknown: [] }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--') {
      out.positionals.push(...argv.slice(i + 1))
      break
    }
    if (arg.startsWith('--') && arg.length > 2) {
      const eq = arg.indexOf('=')
      const key = eq >= 0 ? arg.slice(2, eq) : arg.slice(2)
      if (booleans.has(key)) {
        out.flags.add(key)
      }
      else if (strings.has(key)) {
        out.values[key] = eq >= 0 ? arg.slice(eq + 1) : (argv[++i] ?? '')
      }
      else {
        out.unknown.push(arg)
      }
      continue
    }
    if (arg.startsWith('-') && arg.length > 1) {
      for (let j = 1; j < arg.length; j++) {
        const ch = arg[j]!
        if (booleans.has(ch)) {
          out.flags.add(ch)
        }
        else if (strings.has(ch)) {
          const rest = arg.slice(j + 1)
          out.values[ch] = rest.length > 0 ? rest : (argv[++i] ?? '')
          break
        }
        else {
          out.unknown.push(`-${ch}`)
        }
      }
      continue
    }
    out.positionals.push(arg)
  }
  return out
}
