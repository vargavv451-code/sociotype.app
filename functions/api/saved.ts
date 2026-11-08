import type { KV } from '../../src/server/chatCore'
import { bearer } from '../../src/server/authCore'
import { parseSaved } from '../../src/lib/savedCore'

interface Env {
  USAGE?: KV
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

async function loginOf(request: Request, kv: KV): Promise<string | null> {
  const t = bearer(request)
  return t ? kv.get(`sess:${t}`) : null
}

/** GET — список збережених соціотипів власника сесії. */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.USAGE) return json({ error: 'Немає сховища' }, 503)
  const login = await loginOf(request, env.USAGE)
  if (!login) return json({ error: 'Потрібен вхід' }, 401)
  const raw = await env.USAGE.get(`saved:${login}`)
  let items: unknown = []
  try {
    items = raw ? JSON.parse(raw) : []
  } catch {
    /* пошкоджено — порожній список */
  }
  return json({ items: parseSaved(items) })
}

/** PUT — замінити список (перевіряється й обмежується 16 типами). */
export const onRequestPut = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.USAGE) return json({ error: 'Немає сховища' }, 503)
  const login = await loginOf(request, env.USAGE)
  if (!login) return json({ error: 'Потрібен вхід' }, 401)
  let body: { items?: unknown }
  try {
    body = (await request.json()) as { items?: unknown }
  } catch {
    return json({ error: 'Некоректний запит' }, 400)
  }
  const items = parseSaved(body?.items).slice(0, 16)
  await env.USAGE.put(`saved:${login}`, JSON.stringify(items))
  return json({ items })
}
