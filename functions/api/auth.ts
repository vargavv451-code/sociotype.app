import { checkRate, type KV } from '../../src/server/chatCore'
import { SESSION_TTL, bearer, hashPassword, normalizeLogin, randomHex, safeEqual, validPassword } from '../../src/server/authCore'

interface Env {
  USAGE?: KV
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

async function startSession(kv: KV, login: string) {
  const token = randomHex(32)
  await kv.put(`sess:${token}`, login, { expirationTtl: SESSION_TTL })
  return json({ token, login })
}

/** Реєстрація, вхід і вихід. Пароль зберігається лише як PBKDF2-хеш із сіллю; відновлення пароля не передбачено. */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const kv = env.USAGE
  if (!kv) return json({ error: 'Облікові записи не налаштовані (немає сховища)' }, 503)
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'Некоректний запит' }, 400)
  }
  const action = body?.action

  if (action === 'logout') {
    const t = bearer(request)
    if (t && kv.delete) await kv.delete(`sess:${t}`)
    return new Response(null, { status: 204 })
  }
  if (action !== 'register' && action !== 'login') return json({ error: 'Некоректна дія' }, 400)

  const login = normalizeLogin(body.login)
  if (!login) return json({ error: 'Логін: 3–32 символи, латиниця, цифри, . _ -' }, 400)
  if (!validPassword(body.password)) return json({ error: 'Пароль: від 8 до 128 символів' }, 400)
  const password = body.password

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'

  if (action === 'register') {
    if (!(await checkRate(kv, ip, 10, Date.now(), 'reg'))) return json({ error: 'Забагато спроб. Спробуйте за годину' }, 429)
    if ((await kv.get(`user:${login}`)) !== null) return json({ error: 'Такий логін уже зайнятий' }, 409)
    const salt = randomHex(16)
    const hash = await hashPassword(password, salt)
    await kv.put(`user:${login}`, JSON.stringify({ salt, hash, at: Date.now() }))
    return startSession(kv, login)
  }

  // вхід: окремі ліміти за адресою й за логіном проти підбору пароля
  if (!(await checkRate(kv, ip, 30, Date.now(), 'lgip')) || !(await checkRate(kv, login, 10, Date.now(), 'lg'))) {
    return json({ error: 'Забагато спроб. Спробуйте за годину' }, 429)
  }
  const raw = await kv.get(`user:${login}`)
  const bad = () => json({ error: 'Невірний логін або пароль' }, 401)
  if (!raw) return bad()
  let rec: { salt: string; hash: string }
  try {
    rec = JSON.parse(raw)
  } catch {
    return bad()
  }
  const hash = await hashPassword(password, rec.salt)
  if (!safeEqual(hash, rec.hash)) return bad()
  return startSession(kv, login)
}
