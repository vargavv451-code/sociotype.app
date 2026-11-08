import { logEvent, sanitizeEvent, type KV } from '../../src/server/chatCore'

export const onRequestPost = async ({ request, env }: { request: Request; env: { USAGE?: KV } }) => {
  try {
    const e = sanitizeEvent(await request.json())
    if (e) await logEvent(env.USAGE, e.name, e.props)
  } catch {
    /* статистика не має ламати сайт */
  }
  return new Response(null, { status: 204 })
}
