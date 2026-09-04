import type { Command, CommandContext } from '../types'
import { CurlUsageError, parseCurlArgs, resolveAllowedUrl } from '../net/curl-args'

const EXIT_HOST = 6
const EXIT_REFUSED = 7
const EXIT_HTTP = 22

function statusText(status: number): string {
  const texts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  }
  return texts[status] ?? ''
}

function formatHeaders(res: Response): string[] {
  const lines: string[] = []
  res.headers.forEach((value, key) => {
    lines.push(`${key.toLowerCase()}: ${value}`)
  })
  lines.sort()
  return lines
}

/** In the browser, fetch same-origin relative paths so the live deployment is hit even when siteUrl differs by port. */
function fetchTarget(resolved: string): string {
  if (typeof globalThis.location !== 'undefined') {
    const u = new URL(resolved)
    return u.pathname + u.search
  }
  return resolved
}

function printResponseHeaders(ctx: CommandContext, res: Response): void {
  const reason = statusText(res.status)
  ctx.stdout.line(`HTTP/1.1 ${res.status}${reason ? ` ${reason}` : ''}`)
  for (const line of formatHeaders(res))
    ctx.stdout.line(line)
  ctx.stdout.line()
}

export default {
  name: 'curl',
  description: 'Fetch JSON from this site\'s API (pipe to jq)',
  usage: 'curl [-siIf] [-X METHOD] [-H "key: val"] [-d body] <url>',
  run: async (argv, ctx) => {
    let req
    try {
      req = parseCurlArgs(argv)
    }
    catch (err) {
      if (!(err instanceof CurlUsageError))
        throw err
      ctx.stderr.line(err.message)
      return 2
    }

    const resolved = resolveAllowedUrl(req.url, ctx.env.siteUrl)
    if (resolved === null) {
      ctx.stderr.line(`curl: (${EXIT_REFUSED}) Only ${ctx.env.siteUrl}/api/* is reachable from this terminal`)
      return EXIT_REFUSED
    }

    const displayPath = req.url.startsWith('http') ? new URL(req.url).pathname + new URL(req.url).search : req.url
    if (!req.silent)
      ctx.stderr.line(`→ ${req.method} ${displayPath}`, 'dim')

    let res: Response
    try {
      res = await ctx.net.fetch(fetchTarget(resolved), {
        method: req.method,
        headers: req.headers,
        body: req.body,
        signal: ctx.signal,
      })
    }
    catch {
      ctx.stderr.line(`curl: (${EXIT_HOST}) Could not resolve host`)
      return EXIT_HOST
    }

    if (req.fail && (res.status < 200 || res.status >= 300))
      return EXIT_HTTP

    if (req.includeHeaders || req.headersOnly)
      printResponseHeaders(ctx, res)

    if (!req.headersOnly) {
      const body = await res.text()
      if (body.length > 0)
        ctx.stdout.write(body)
    }

    return 0
  },
} satisfies Command
