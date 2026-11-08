import { askClaude, buildSystem, checkRate, logEvent, parseChatBody, type KV } from '../../src/server/chatCore'

interface Env {
  ANTHROPIC_API_KEY?: string
  CHAT_MODEL?: string
  CHAT_LIMIT?: string
  LOG_QUESTIONS?: string
  USAGE?: KV
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'Чат ще не налаштовано (немає ключа API)' }, 503)
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return json({ error: 'Некоректний запит' }, 400)
  }
  const parsed = parseChatBody(raw)
  if (!parsed.ok) return json({ error: parsed.error }, 400)

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  if (!(await checkRate(env.USAGE, ip, Number(env.CHAT_LIMIT) || 20))) {
    return json({ error: 'Ліміт запитів на годину вичерпано. Спробуйте пізніше.' }, 429)
  }

  try {
    const answer = await askClaude({
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.CHAT_MODEL || 'claude-sonnet-5-5',
      system: buildSystem(parsed.value.context),
      messages: parsed.value.messages,
    })
    const last = parsed.value.messages[parsed.value.messages.length - 1].content
    await logEvent(env.USAGE, 'chat', env.LOG_QUESTIONS === 'true' ? { q: last } : { chars: String(last.length) })
    return json({ answer })
  } catch {
    return json({ error: 'Не вдалося отримати відповідь. Спробуйте ще раз.' }, 502)
  }
}
