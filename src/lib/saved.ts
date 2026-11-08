import { useCallback, useState } from 'react'
import { TYPE_CODES } from '../data/sociotypes'
import type { TypeCode } from '../data/types'

export interface SavedItem {
  code: TypeCode
  note: string
  at: number
}

const KEY = 'socio-saved'
const MAX_NOTE = 600

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

function load(): SavedItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? parseSaved(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

function store(items: SavedItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    /* сховище недоступне — список діє до закриття сторінки */
  }
}

/** Збережені соціотипи з власними нотатками користувача (лише на цьому пристрої). */
export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>(load)

  const update = useCallback((fn: (prev: SavedItem[]) => SavedItem[]) => {
    setItems((prev) => {
      const next = fn(prev)
      store(next)
      return next
    })
  }, [])

  const isSaved = (c: TypeCode) => items.some((i) => i.code === c)
  const toggle = (c: TypeCode) =>
    update((prev) => (prev.some((i) => i.code === c) ? prev.filter((i) => i.code !== c) : [{ code: c, note: '', at: Date.now() }, ...prev]))
  const remove = (c: TypeCode) => update((prev) => prev.filter((i) => i.code !== c))
  const setNote = (c: TypeCode, note: string) =>
    update((prev) => prev.map((i) => (i.code === c ? { ...i, note: note.slice(0, MAX_NOTE) } : i)))

  return { items, isSaved, toggle, remove, setNote }
}
