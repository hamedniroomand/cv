import { defineEventHandler, noContent } from 'h3'

/** Public read-only API: anyone may GET it from anywhere. */
export default defineEventHandler((event) => {
  if (!event.url.pathname.startsWith('/api/'))
    return
  const headers = event.res.headers
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Access-Control-Max-Age', '86400')
  if (event.req.method === 'OPTIONS')
    return noContent()
})
