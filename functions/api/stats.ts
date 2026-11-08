import { aggregate, type KV } from '../../src/server/chatCore'

interface ListKV extends KV {
  list(opts: { prefix: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>
}

/** GET /api/stats?token=... — підсумок подій. Токен задається змінною STATS_TOKEN. */
export const onRequestGet = async ({ request, env }: { request: Request; env: { USAGE?: ListKV; STATS_TOKEN?: string } }) => {
  const token = new URL(request.url).searchParams.get('token')
  if (!env.STATS_TOKEN || token !== env.STATS_TOKEN) return new Response('Forbidden', { status: 403 })
  if (!env.USAGE) return new Response(JSON.stringify({ error: 'KV USAGE не підключено' }), { status: 503 })
  const events: { name: string; props: Record<string, string> }[] = []
  let cursor: string | undefined
  let pages = 0
  do {
    const page = await env.USAGE.list({ prefix: 'ev:', limit: 1000, cursor })
    for (const k of page.keys) {
      const v = await env.USAGE.get(k.name)
      if (v) events.push(JSON.parse(v))
    }
    cursor = page.list_complete ? undefined : page.cursor
  } while (cursor && ++pages < 5)
  return new Response(JSON.stringify({ total: events.length, byEvent: aggregate(events) }, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}
