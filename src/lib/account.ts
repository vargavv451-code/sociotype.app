import { parseSaved, type SavedItem } from './savedCore'

const KEY = 'socio-account'

export interface Account {
  token: string
  login: string
}

export function loadAccount(): Account | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (v && typeof v.token === 'string' && typeof v.login === 'string') return v
  } catch {
    /* немає або пошкоджено */
  }
  return null
}

export function storeAccount(a: Account | null) {
  try {
    if (a) localStorage.setItem(KEY, JSON.stringify(a))
    else localStorage.removeItem(KEY)
  } catch {
    /* ігноруємо */
  }
}

export class AuthError extends Error {}

async function call(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(path, init)
  } catch {
    throw new Error('Немає зв’язку з сервером')
  }
}

const jsonHeaders = (token?: string) => ({ 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) })

export async function authenticate(action: 'login' | 'register', login: string, password: string): Promise<Account> {
  const res = await call('/api/auth', { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ action, login, password }) })
  let data: { token?: string; login?: string; error?: string } = {}
  try {
    data = await res.json()
  } catch {
    /* не JSON */
  }
  if (!res.ok || !data.token || !data.login) {
    throw new Error(data.error ?? (res.status === 404 ? 'Вхід працює лише на розміщеному сайті' : 'Не вдалося виконати вхід'))
  }
  return { token: data.token, login: data.login }
}

export async function logoutRemote(token: string) {
  try {
    await fetch('/api/auth', { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify({ action: 'logout' }) })
  } catch {
    /* сесія закінчиться сама */
  }
}

export async function fetchSaved(token: string): Promise<SavedItem[]> {
  const res = await call('/api/saved', { headers: jsonHeaders(token) })
  if (res.status === 401) throw new AuthError('Сесія закінчилась. Увійдіть знову')
  if (!res.ok) throw new Error('Не вдалося завантажити список')
  return parseSaved((await res.json()).items)
}

export async function pushSaved(token: string, items: SavedItem[]): Promise<void> {
  const res = await call('/api/saved', { method: 'PUT', headers: jsonHeaders(token), body: JSON.stringify({ items }) })
  if (res.status === 401) throw new AuthError('Сесія закінчилась. Увійдіть знову')
  if (!res.ok) throw new Error('Не вдалося зберегти на сервері')
}
