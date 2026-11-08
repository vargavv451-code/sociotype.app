import { hashIp, logEvent, type KV } from '../../src/server/chatCore'

interface Env {
  USAGE?: KV
  ACK_SALT?: string
}

export const DISCLAIMER_VERSION = 1

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

const keyFor = async (request: Request, env: Env) =>
  `ack:v${DISCLAIMER_VERSION}:${await hashIp(request.headers.get('cf-connecting-ip') ?? 'unknown', env.ACK_SALT || 'sociotype')}`

/** GET: чи вже підтверджено попередження з цієї адреси. */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.USAGE) return json({ acked: false })
  return json({ acked: (await env.USAGE.get(await keyFor(request, env))) !== null })
}

/** POST: записати підтвердження (час і версія тексту; адреса зберігається лише як хеш). */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (env.USAGE) {
    const key = await keyFor(request, env)
    if ((await env.USAGE.get(key)) === null) {
      await env.USAGE.put(key, JSON.stringify({ t: new Date().toISOString(), v: DISCLAIMER_VERSION }), { expirationTtl: 60 * 60 * 24 * 365 })
      await logEvent(env.USAGE, 'ack', { v: String(DISCLAIMER_VERSION) })
    }
  }
  return new Response(null, { status: 204 })
}
