import process from 'node:process';

const port = Number(process.env.PORT ?? 3458);
const messages: unknown[] = [];

Bun.serve({
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === '/health') return Response.json({ ok: true });
    if (pathname === '/messages') return Response.json(messages);
    if (pathname === '/webhook' && request.method === 'POST') {
      messages.push(await request.json());
      return Response.json({ id: String(messages.length) });
    }
    return new Response('not found', { status: 404 });
  },
});

console.warn(`mock discord webhook listening on http://localhost:${port}`);
