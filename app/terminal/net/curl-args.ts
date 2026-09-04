export interface CurlRequest {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  silent: boolean
  includeHeaders: boolean
  headersOnly: boolean
  fail: boolean
}

export class CurlUsageError extends Error {}

function isJsonBody(body: string): boolean {
  const t = body.trimStart()
  return t.startsWith('{') || t.startsWith('[')
}

function parseHeader(value: string): [string, string] {
  const i = value.indexOf(':')
  if (i < 0)
    throw new CurlUsageError(`curl: invalid header: ${value}`)
  return [value.slice(0, i).trim(), value.slice(i + 1).trim()]
}

/** Parses curl argv into a structured request. */
export function parseCurlArgs(argv: string[]): CurlRequest {
  let silent = false
  let includeHeaders = false
  let headersOnly = false
  let fail = false
  let method: string | undefined
  let body: string | undefined
  const headers: Record<string, string> = {}
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--') {
      positionals.push(...argv.slice(i + 1))
      break
    }
    if (arg.startsWith('--') && arg.length > 2) {
      const eq = arg.indexOf('=')
      const key = eq >= 0 ? arg.slice(2, eq) : arg.slice(2)
      const val = eq >= 0 ? arg.slice(eq + 1) : undefined
      switch (key) {
        case 'silent':
          silent = true
          break
        case 'include':
          includeHeaders = true
          break
        case 'head':
          headersOnly = true
          break
        case 'fail':
          fail = true
          break
        case 'request':
          method = val ?? argv[++i]
          break
        case 'header': {
          const raw = val ?? argv[++i]
          if (raw === undefined)
            throw new CurlUsageError('curl: option requires an argument: --header')
          const [k, v] = parseHeader(raw)
          headers[k] = v
          break
        }
        case 'data':
          body = val ?? argv[++i]
          break
        case 'location':
          break
        case 'output':
          throw new CurlUsageError('curl: -o is not supported here')
        default:
          throw new CurlUsageError(`curl: unknown option: --${key}`)
      }
      continue
    }
    if (arg.startsWith('-') && arg.length > 1) {
      for (let j = 1; j < arg.length; j++) {
        const ch = arg[j]!
        switch (ch) {
          case 's':
            silent = true
            break
          case 'i':
            includeHeaders = true
            break
          case 'I':
            headersOnly = true
            break
          case 'f':
            fail = true
            break
          case 'L':
            break
          case 'X': {
            const rest = arg.slice(j + 1)
            method = rest.length > 0 ? rest : argv[++i]
            j = arg.length
            break
          }
          case 'H': {
            const rest = arg.slice(j + 1)
            const raw = rest.length > 0 ? rest : argv[++i]
            if (raw === undefined)
              throw new CurlUsageError('curl: option requires an argument: -H')
            const [k, v] = parseHeader(raw)
            headers[k] = v
            j = arg.length
            break
          }
          case 'd': {
            const rest = arg.slice(j + 1)
            body = rest.length > 0 ? rest : argv[++i]
            j = arg.length
            break
          }
          case 'o':
            throw new CurlUsageError('curl: -o is not supported here')
          default:
            throw new CurlUsageError(`curl: unknown option: -${ch}`)
        }
      }
      continue
    }
    positionals.push(arg)
  }

  if (positionals.length === 0)
    throw new CurlUsageError('curl: no URL specified')
  if (positionals.length > 1)
    throw new CurlUsageError('curl: too many URLs')

  const url = positionals[0]!
  let resolvedMethod = method ?? (body !== undefined ? 'POST' : 'GET')
  if (headersOnly && method === undefined)
    resolvedMethod = 'HEAD'

  if (body !== undefined && isJsonBody(body) && !Object.keys(headers).some(k => k.toLowerCase() === 'content-type'))
    headers['Content-Type'] = 'application/json'

  return {
    url,
    method: resolvedMethod.toUpperCase(),
    headers,
    body,
    silent,
    includeHeaders,
    headersOnly,
    fail,
  }
}

function siteOrigin(siteUrl: string): string {
  return new URL(siteUrl).origin
}

function isApiPath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/')
}

/** Resolves a user URL to an allowed same-origin API URL, or null if refused. */
export function resolveAllowedUrl(raw: string, siteUrl: string): string | null {
  const allowedOrigin = siteOrigin(siteUrl)

  let parsed: URL
  try {
    if (raw.startsWith('/'))
      parsed = new URL(raw, siteUrl)
    else if (/^[\w.-]+(?::\d+)?\//.test(raw) || /^[\w.-]+(?::\d+)?$/.test(raw))
      parsed = new URL(`https://${raw}`)
    else
      parsed = new URL(raw)
  }
  catch {
    return null
  }

  if (parsed.origin !== allowedOrigin)
    return null
  if (!isApiPath(parsed.pathname))
    return null
  return parsed.toString()
}
