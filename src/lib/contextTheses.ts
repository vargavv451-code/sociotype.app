import { useEffect, useState } from 'react'
import type { KFunctionId } from '../data/kal/cellTypes'
import type { AspectCode, ContextId, Reaction } from '../data/types'

export type ThesesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; items: string[] }
  | { status: 'error'; message: string }

const memo = new Map<string, string[]>()

export async function fetchContextTheses(
  req: { aspect: AspectCode; fn: KFunctionId; reaction: Reaction; context: ContextId },
  fetchFn: typeof fetch = fetch,
): Promise<string[]> {
  const key = `${req.aspect}:${req.fn}:${req.reaction}:${req.context}`
  const hit = memo.get(key)
  if (hit) return hit
  let res: Response
  try {
    res = await fetchFn('/api/theses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(req) })
  } catch {
    throw new Error('Немає зв’язку з сервером')
  }
  let data: { theses?: string[]; error?: string } = {}
  try {
    data = await res.json()
  } catch {
    /* не JSON */
  }
  if (!res.ok || !Array.isArray(data.theses)) throw new Error(data.error ?? 'Контекстні тези недоступні')
  memo.set(key, data.theses)
  return data.theses
}

export function useContextTheses(req: { aspect: AspectCode; fn: KFunctionId; reaction: Reaction; context: ContextId } | null): ThesesState {
  const [state, setState] = useState<ThesesState>({ status: 'idle' })
  const key = req ? `${req.aspect}:${req.fn}:${req.reaction}:${req.context}` : ''
  useEffect(() => {
    if (!req) {
      setState({ status: 'idle' })
      return
    }
    let alive = true
    setState({ status: 'loading' })
    fetchContextTheses(req)
      .then((items) => alive && setState({ status: 'ok', items }))
      .catch((e) => alive && setState({ status: 'error', message: e instanceof Error ? e.message : 'Помилка' }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}
