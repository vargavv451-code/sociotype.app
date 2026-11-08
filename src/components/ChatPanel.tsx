import { useEffect, useRef, useState } from 'react'
import { usePersistentState } from '../lib/persist'
import { track } from '../lib/track'
import { SourceTag } from './ui'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

export const CHAT_ENDPOINT = '/api/chat'

export async function sendChat(messages: Msg[], context: string, fetchFn: typeof fetch = fetch): Promise<string> {
  let res: Response
  try {
    res = await fetchFn(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    })
  } catch {
    throw new Error('Немає зв’язку з сервером')
  }
  let data: { answer?: string; error?: string } = {}
  try {
    data = await res.json()
  } catch {
    /* не JSON */
  }
  if (!res.ok || !data.answer) {
    throw new Error(data.error ?? (res.status === 404 ? 'Чат працює лише на розміщеному сайті, не в локальному режимі' : 'Не вдалося отримати відповідь'))
  }
  return data.answer
}

export function ChatPanel({ context }: { context: string }) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = usePersistentState<Msg[]>('socio-chat', [], (v) => Array.isArray(v))
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [msgs, busy, open])

  const submit = async () => {
    const text = input.trim()
    if (!text || busy) return
    const next = [...msgs, { role: 'user' as const, content: text }]
    setMsgs(next)
    setInput('')
    setError('')
    setBusy(true)
    track('chat')
    try {
      const answer = await sendChat(next.slice(-11), context)
      setMsgs([...next, { role: 'assistant', content: answer }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
      >
        Запитати Claude
      </button>
    )
  }

  return (
    <section
      aria-label="Чат із Claude"
      className="fixed inset-x-2 bottom-2 z-40 flex max-h-[80dvh] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border border-stone-300 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[26rem] dark:border-stone-600 dark:bg-stone-800"
    >
      <header className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-2.5 dark:border-stone-700">
        <h2 className="text-sm font-semibold">Уточнити в Claude</h2>
        <div className="flex items-center gap-2">
          {msgs.length > 0 && (
            <button type="button" onClick={() => { setMsgs([]); setError('') }} className="text-xs text-stone-500 underline-offset-2 hover:underline dark:text-stone-400">
              Нова розмова
            </button>
          )}
          <button type="button" aria-label="Закрити чат" onClick={() => setOpen(false)} className="rounded px-2 py-0.5 text-lg leading-none text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700">
            ×
          </button>
        </div>
      </header>

      <div className="min-h-[8rem] min-w-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        {msgs.length === 0 && (
          <p className="text-stone-500 dark:text-stone-400">
            Поставте уточнювальне питання. Claude бачить, який соціотип і розділ відкрито. Відповідь — від мовної моделі, вона може помилятися.
          </p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'ml-6 min-w-0 break-words rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-950/40' : 'mr-2 min-w-0 break-words rounded-lg bg-stone-100 p-2.5 dark:bg-stone-900/40'}>
            <p className="whitespace-pre-wrap break-words leading-relaxed [overflow-wrap:anywhere]">{m.content}</p>
            {m.role === 'assistant' && <SourceTag s="ШІ" />}
          </div>
        ))}
        {busy && <p className="text-stone-500 dark:text-stone-400">Claude відповідає…</p>}
        {error && <p role="alert" className="text-rose-700 dark:text-rose-300">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        className="flex gap-2 border-t border-stone-200 p-3 dark:border-stone-700"
        onSubmit={(e) => { e.preventDefault(); void submit() }}
      >
        <textarea
          aria-label="Ваше питання"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit() } }}
          rows={2}
          maxLength={1500}
          placeholder="Ваше питання…"
          className="min-w-0 flex-1 resize-none rounded-lg border border-stone-300 bg-white p-2 text-base sm:text-sm dark:border-stone-600 dark:bg-stone-900/40"
        />
        <button type="submit" disabled={busy || !input.trim()} className="self-end rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
          Надіслати
        </button>
      </form>
    </section>
  )
}
