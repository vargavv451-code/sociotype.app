import { askClaude, checkRate, logEvent, type KV } from '../../src/server/chatCore'
import { THESES_SYSTEM, buildThesesUser, parseTheses, parseThesesRequest, thesesCacheKey } from '../../src/server/thesesCore'

interface Env {
  ANTHROPIC_API_KEY?: string
  CHAT_MODEL?: string
  THESES_LIMIT?: string
  USAGE?: KV
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

/** Тези під контекст спілкування: генеруються один раз для комбінації й кешуються в KV. */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return json({ error: 'Некоректний запит' }, 400)
  }
  const req = parseThesesRequest(raw)
  if (!req) return json({ error: 'Некоректні параметри' }, 400)

  const key = thesesCacheKey(req)
  const cached = env.USAGE ? await env.USAGE.get(key) : null
  if (cached) {
    try {
      const theses = JSON.parse(cached)
      if (Array.isArray(theses) && theses.length === 10) return json({ theses, cached: true })
    } catch {
      /* кеш пошкоджено — генеруємо знову */
    }
  }

  if (!env.ANTHROPIC_API_KEY) return json({ error: 'Генерація не налаштована' }, 503)
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  if (!(await checkRate(env.USAGE, ip, Number(env.THESES_LIMIT) || 60, Date.now(), 'rt'))) {
    return json({ error: 'Ліміт запитів на годину вичерпано' }, 429)
  }

  try {
    const text = await askClaude({
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.CHAT_MODEL || 'claude-sonnet-5-5',
      system: THESES_SYSTEM,
      messages: [{ role: 'user', content: buildThesesUser(req) }],
    })
    const theses = parseTheses(text)
    if (!theses) return json({ error: 'Не вдалося сформувати тези' }, 502)
    if (env.USAGE) await env.USAGE.put(key, JSON.stringify(theses), { expirationTtl: 60 * 60 * 24 * 365 })
    await logEvent(env.USAGE, 'theses', { aspect: req.aspect, fn: String(req.fn), ctx: req.context })
    return json({ theses, cached: false })
  } catch {
    return json({ error: 'Не вдалося отримати тези' }, 502)
  }
}
