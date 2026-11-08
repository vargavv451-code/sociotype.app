import { useCallback, useEffect, useRef, useState } from 'react'
import type { TypeCode } from '../data/types'
import { AuthError, authenticate, fetchSaved, loadAccount, logoutRemote, pushSaved, storeAccount, type Account } from './account'
import { MAX_NOTE, mergeSaved, parseSaved, type SavedItem } from './savedCore'

export { parseSaved, mergeSaved, type SavedItem } from './savedCore'

const KEY = 'socio-saved'

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

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error'

/**
 * Збережені соціотипи з власними нотатками. Завжди є копія в браузері; після входу
 * список синхронізується із сервером і доступний на всіх пристроях.
 */
export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>(load)
  const [account, setAccount] = useState<Account | null>(loadAccount)
  const [status, setStatus] = useState<SyncStatus>(account ? 'syncing' : 'local')
  const [error, setError] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const ready = useRef(false) // після входу: чи завершено початкове злиття із сервером

  const signOutLocal = useCallback(() => {
    storeAccount(null)
    setAccount(null)
    setStatus('local')
    ready.current = false
  }, [])

  // початкове злиття після входу або відкриття сторінки з уже наявною сесією
  useEffect(() => {
    if (!account) return
    let alive = true
    ready.current = false
    setStatus('syncing')
    void (async () => {
      try {
        const server = await fetchSaved(account.token)
        const merged = mergeSaved(load(), server)
        if (!alive) return
        store(merged)
        setItems(merged)
        await pushSaved(account.token, merged)
        if (!alive) return
        ready.current = true
        setStatus('synced')
        setError('')
      } catch (e) {
        if (!alive) return
        if (e instanceof AuthError) {
          signOutLocal()
          setError(e.message)
        } else {
          setStatus('error')
          setError(e instanceof Error ? e.message : 'Помилка')
        }
      }
    })()
    return () => { alive = false }
  }, [account, signOutLocal])

  const schedulePush = useCallback((next: SavedItem[]) => {
    if (!account || !ready.current) return
    setStatus('syncing')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      pushSaved(account.token, next).then(
        () => { setStatus('synced'); setError('') },
        (e) => {
          if (e instanceof AuthError) { signOutLocal(); setError(e.message) }
          else { setStatus('error'); setError(e instanceof Error ? e.message : 'Помилка') }
        },
      )
    }, 600)
  }, [account, signOutLocal])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const update = useCallback((fn: (prev: SavedItem[]) => SavedItem[]) => {
    setItems((prev) => {
      const next = fn(prev)
      store(next)
      schedulePush(next)
      return next
    })
  }, [schedulePush])

  const isSaved = (c: TypeCode) => items.some((i) => i.code === c)
  const toggle = (c: TypeCode) =>
    update((prev) => (prev.some((i) => i.code === c) ? prev.filter((i) => i.code !== c) : [{ code: c, note: '', at: Date.now() }, ...prev]))
  const remove = (c: TypeCode) => update((prev) => prev.filter((i) => i.code !== c))
  const setNote = (c: TypeCode, note: string) =>
    update((prev) => prev.map((i) => (i.code === c ? { ...i, note: note.slice(0, MAX_NOTE) } : i)))

  const signIn = async (action: 'login' | 'register', login: string, password: string) => {
    const a = await authenticate(action, login, password)
    storeAccount(a)
    setError('')
    setAccount(a)
  }
  const signOut = () => {
    if (account) void logoutRemote(account.token)
    signOutLocal()
  }

  return { items, isSaved, toggle, remove, setNote, account, status, error, signIn, signOut }
}
