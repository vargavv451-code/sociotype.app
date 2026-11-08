import { describe, expect, it } from 'vitest'
import { onRequestPost as auth } from '../../functions/api/auth'
import { onRequestGet as savedGet, onRequestPut as savedPut } from '../../functions/api/saved'
import { hashPassword, normalizeLogin, randomHex, safeEqual, validPassword } from './authCore'
import { mergeSaved } from '../lib/savedCore'
import type { KV } from './chatCore'

const memKV = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return { data, get: async (k) => data.get(k) ?? null, put: async (k, v) => { data.set(k, v) }, delete: async (k) => { data.delete(k) } }
}
const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://x/api/auth', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) })

describe('authCore', () => {
  it('нормалізує й перевіряє логін та пароль', () => {
    expect(normalizeLogin(' Vasyl_1 ')).toBe('vasyl_1')
    expect(normalizeLogin('ab')).toBeNull()
    expect(normalizeLogin('a b c')).toBeNull()
    expect(normalizeLogin(5)).toBeNull()
    expect(validPassword('1234567')).toBe(false)
    expect(validPassword('12345678')).toBe(true)
  })
  it('хеш детермінований і залежить від солі й пароля', async () => {
    const s = randomHex(16)
    const a = await hashPassword('password1', s)
    expect(a).toBe(await hashPassword('password1', s))
    expect(a).not.toBe(await hashPassword('password2', s))
    expect(a).not.toBe(await hashPassword('password1', randomHex(16)))
    expect(safeEqual(a, a)).toBe(true)
    expect(safeEqual(a, a.slice(1) + '0')).toBe(false)
  })
})

describe('/api/auth і /api/saved', () => {
  it('реєстрація → список → вхід з іншого пристрою → вихід', async () => {
    const kv = memKV()
    const env = { USAGE: kv }
    const reg = await auth({ request: post({ action: 'register', login: 'Vasyl', password: 'secret-pass' }), env })
    expect(reg.status).toBe(200)
    const { token, login } = await reg.json()
    expect(login).toBe('vasyl')
    // пароль у відкритому вигляді не зберігається
    expect([...kv.data.values()].some((v) => v.includes('secret-pass'))).toBe(false)

    const put = await savedPut({ request: new Request('https://x/api/saved', { method: 'PUT', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ items: [{ code: 'IEE', note: 'n', at: 1 }, { code: 'ZZZ' }] }) }), env })
    expect((await put.json()).items).toHaveLength(1)

    const dev2 = await (await auth({ request: post({ action: 'login', login: 'vasyl', password: 'secret-pass' }), env })).json()
    const got = await savedGet({ request: new Request('https://x/api/saved', { headers: { authorization: `Bearer ${dev2.token}` } }), env })
    expect((await got.json()).items[0]).toMatchObject({ code: 'IEE', note: 'n' })

    await auth({ request: post({ action: 'logout' }, { authorization: `Bearer ${dev2.token}` }), env })
    const after = await savedGet({ request: new Request('https://x/api/saved', { headers: { authorization: `Bearer ${dev2.token}` } }), env })
    expect(after.status).toBe(401)
  })

  it('дублікат логіну, невірний пароль, без сесії', async () => {
    const env = { USAGE: memKV() }
    await auth({ request: post({ action: 'register', login: 'user1', password: 'password1' }), env })
    expect((await auth({ request: post({ action: 'register', login: 'USER1', password: 'password2' }), env })).status).toBe(409)
    expect((await auth({ request: post({ action: 'login', login: 'user1', password: 'wrongpass1' }), env })).status).toBe(401)
    expect((await auth({ request: post({ action: 'login', login: 'nobody', password: 'password1' }), env })).status).toBe(401)
    expect((await savedGet({ request: new Request('https://x/api/saved'), env })).status).toBe(401)
    expect((await auth({ request: post({ action: 'register', login: 'x', password: 'password1' }), env })).status).toBe(400)
  })

  it('обмежує підбір пароля', async () => {
    const env = { USAGE: memKV() }
    await auth({ request: post({ action: 'register', login: 'victim', password: 'password1' }), env })
    let last = 0
    for (let i = 0; i < 12; i++) last = (await auth({ request: post({ action: 'login', login: 'victim', password: 'bad-pass-' + i }), env })).status
    expect(last).toBe(429)
    // навіть правильний пароль після ліміту не пускає
    expect((await auth({ request: post({ action: 'login', login: 'victim', password: 'password1' }), env })).status).toBe(429)
  })
})

describe('mergeSaved', () => {
  it('поєднує списки й зберігає непорожню нотатку', () => {
    const m = mergeSaved(
      [{ code: 'IEE', note: 'моя', at: 5 }, { code: 'LII', note: '', at: 1 }],
      [{ code: 'IEE', note: '', at: 2 }, { code: 'SEE', note: 'x', at: 3 }],
    )
    expect(m.map((i) => i.code).sort()).toEqual(['IEE', 'LII', 'SEE'])
    expect(m.find((i) => i.code === 'IEE')!.note).toBe('моя')
  })
})
