export const LOGIN_RE = /^[a-z0-9_.-]{3,32}$/
export const PW_MIN = 8
export const PW_MAX = 128
export const PBKDF2_ITERATIONS = 100_000
export const SESSION_TTL = 60 * 60 * 24 * 30

export function normalizeLogin(x: unknown): string | null {
  if (typeof x !== 'string') return null
  const l = x.trim().toLowerCase()
  return LOGIN_RE.test(l) ? l : null
}

export function validPassword(x: unknown): x is string {
  return typeof x === 'string' && x.length >= PW_MIN && x.length <= PW_MAX
}

const toHex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')

export const randomHex = (bytes: number) => toHex(crypto.getRandomValues(new Uint8Array(bytes)))

export async function hashPassword(password: string, saltHex: string, iterations = PBKDF2_ITERATIONS): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const salt = new Uint8Array(saltHex.match(/../g)!.map((h) => parseInt(h, 16)))
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  return toHex(bits)
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let d = 0
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return d === 0
}

export const bearer = (request: Request): string | null => {
  const m = /^Bearer ([a-f0-9]{64})$/.exec(request.headers.get('authorization') ?? '')
  return m ? m[1] : null
}
