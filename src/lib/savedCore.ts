import { TYPE_CODES } from '../data/sociotypes'
import type { TypeCode } from '../data/types'

export interface SavedItem {
  code: TypeCode
  note: string
  at: number
}

export const MAX_NOTE = 600

/** Перевіряє список збережених типів (з браузера чи сервера): невідомі коди, дублі й сміття відкидаються. */
export function parseSaved(raw: unknown): SavedItem[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: SavedItem[] = []
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue
    const { code, note, at } = r as Record<string, unknown>
    if (typeof code !== 'string' || !(TYPE_CODES as string[]).includes(code) || seen.has(code)) continue
    seen.add(code)
    out.push({
      code: code as TypeCode,
      note: typeof note === 'string' ? note.slice(0, MAX_NOTE) : '',
      at: typeof at === 'number' ? at : 0,
    })
  }
  return out
}

/** Об'єднання локального списку із серверним: типи з обох, нотатка — непорожня (серверна в пріоритеті). */
export function mergeSaved(local: SavedItem[], server: SavedItem[]): SavedItem[] {
  const map = new Map<string, SavedItem>()
  for (const i of server) map.set(i.code, i)
  for (const i of local) {
    const s = map.get(i.code)
    if (!s) map.set(i.code, i)
    else if (!s.note && i.note) map.set(i.code, { ...s, note: i.note })
  }
  return [...map.values()].sort((a, b) => b.at - a.at)
}

/** Основний соціотип профілю: один код або null. */
export function parseMain(x: unknown): TypeCode | null {
  return typeof x === 'string' && (TYPE_CODES as string[]).includes(x) ? (x as TypeCode) : null
}
