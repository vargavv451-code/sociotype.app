import type { KV } from '../../src/server/chatCore'
import { bearer } from '../../src/server/authCore'
import { parseMain, parseSaved } from '../../src/lib/savedCore'

interface Env {
  USAGE?: KV
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

async function loginOf(request: Request, kv: KV): Promise<string | null> {
  const t = bearer(request)
  return t ? kv.get(`sess:${t}`) : null
}

async function readRecord(kv: KV, login: string): Promise<{ items: ReturnType<typeof parseSaved>; main: ReturnType<typeof parseMain> }> {
  const raw = await kv.get(`saved:${login}`)
  try {
    const v = raw ? JSON.parse(raw) : []
    // старий формат — просто масив; новий — { items, main }
    if (Array.isArray(v)) return { items: parseSaved(v), main: null }
    return { items: parseSaved(v?.items), main: parseMain(v?.main) }
  } catch {
    return { items: [], main: null }
  }
}

/** GET — список збережених соціотипів власника сесії. */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.USAGE) return json({ error: 'Немає сховища' }, 503)
  const login = await loginOf(request, env.USAGE)
  if (!login) return json({ error: 'Потрібен вхід' }, 401)
  return json(await readRecord(env.USAGE, login))
}

/** PUT — замінити список (перевіряється й обмежується 16 типами). */
export const onRequestPut = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.USAGE) return json({ error: 'Немає сховища' }, 503)
  const login = await loginOf(request, env.USAGE)
  if (!login) return json({ error: 'Потрібен вхід' }, 401)
  let body: { items?: unknown; main?: unknown }
  try {
    body = (await request.json()) as { items?: unknown; main?: unknown }
  } catch {
    return json({ error: 'Некоректний запит' }, 400)
  }
  const items = parseSaved(body?.items).slice(0, 16)
  const prev = await readRecord(env.USAGE, login)
  // «main» не передано — лишається попереднє значення; null очищає
  const main = 'main' in (body ?? {}) ? parseMain(body.main) : prev.main
  await env.USAGE.put(`saved:${login}`, JSON.stringify({ items, main }))
  return json({ items, main })
}
