import { defineEventHandler, noContent } from 'nitro/h3'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

export default defineEventHandler((event) => {
  if (!event.url.pathname.startsWith('/api/'))
    return
  for (const [name, value] of Object.entries(CORS_HEADERS))
    event.res.headers.set(name, value)
  if (event.req.method === 'OPTIONS')
    return noContent()
})
