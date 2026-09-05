export interface FlagSpec {
  boolean?: string[];
  string?: string[];
}

export interface ParsedArgs {
  flags: Set<string>;
  values: Record<string, string>;
  positionals: string[];
  unknown: string[];
}

export function parseFlags(argv: string[], spec: FlagSpec): ParsedArgs {
  const booleans = new Set(spec.boolean ?? []);
  const strings = new Set(spec.string ?? []);
  const out: ParsedArgs = { flags: new Set(), values: {}, positionals: [], unknown: [] };

  const readLong = (arg: string, index: number): number => {
    const eq = arg.indexOf('=');
    const key = eq >= 0 ? arg.slice(2, eq) : arg.slice(2);
    if (booleans.has(key)) {
      out.flags.add(key);
      return index;
    }
    if (strings.has(key)) {
      if (eq >= 0) {
        out.values[key] = arg.slice(eq + 1);
        return index;
      }
      out.values[key] = argv[index + 1] ?? '';
      return index + 1;
    }
    out.unknown.push(arg);
    return index;
  };

  const readShort = (arg: string, index: number): number => {
    for (let j = 1; j < arg.length; j++) {
      const ch = arg[j]!;
      if (booleans.has(ch)) {
        out.flags.add(ch);
        continue;
      }
      if (strings.has(ch)) {
        const rest = arg.slice(j + 1);
        if (rest.length > 0) {
          out.values[ch] = rest;
          return index;
        }
        out.values[ch] = argv[index + 1] ?? '';
        return index + 1;
      }
      out.unknown.push(`-${ch}`);
    }
    return index;
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === '--') {
      out.positionals.push(...argv.slice(i + 1));
      break;
    }
    if (arg.startsWith('--') && arg.length > 2) i = readLong(arg, i);
    else if (arg.startsWith('-') && arg.length > 1) i = readShort(arg, i);
    else out.positionals.push(arg);
  }
  return out;
}
