import { useEffect, useState } from 'react'

const KEY = 'socio-ack-v1'

export const DISCLAIMER_TEXT =
  'Цей сайт створено за допомогою штучного інтелекту як приватний любительський експеримент із новою формою вивчення й дослідження соціоніки. Він не призначений для розповсюдження третім особам, комерційного використання чи продажу.'

function wasAcknowledged(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** Повноекранне попередження при першому відкритті: або вийти, або підтвердити, що ознайомлені. */
export function DisclaimerGate() {
  const [state, setState] = useState<'checking' | 'show' | 'hidden'>(() => (wasAcknowledged() ? 'hidden' : 'checking'))

  // Якщо на цьому пристрої підтвердження немає, перевіряємо на сервері: з тієї ж адреси його могли дати з іншого браузера чи з іконки на екрані.
  useEffect(() => {
    if (state !== 'checking') return
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 2500)
    fetch('/api/ack', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { acked: false }))
      .then((d: { acked?: boolean }) => {
        if (d.acked) {
          try {
            localStorage.setItem(KEY, '1')
          } catch {
            /* ігноруємо */
          }
          setState('hidden')
        } else setState('show')
      })
      .catch(() => setState('show'))
      .finally(() => window.clearTimeout(timer))
    return () => {
      ctrl.abort()
      window.clearTimeout(timer)
    }
  }, [state])

  if (state !== 'show') return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4" role="dialog" aria-modal="true" aria-labelledby="disc-title">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl dark:bg-stone-800">
        <h2 id="disc-title" className="text-lg font-semibold">Важливе попередження</h2>
        <p className="mt-3 text-sm leading-relaxed">{DISCLAIMER_TEXT}</p>
        <p className="mt-3 text-sm font-medium leading-relaxed">
          Якщо ви потрапили сюди випадково, залиште сайт і не користуйтеся ним.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem(KEY, '1')
              } catch {
                /* сховище недоступне — попередження покажеться знову */
              }
              try {
                void fetch('/api/ack', { method: 'POST', keepalive: true }).catch(() => {})
              } catch {
                /* ігноруємо */
              }
              setState('hidden')
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Розумію, продовжити
          </button>
          <button
            type="button"
            onClick={() => window.location.replace('about:blank')}
            className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
          >
            Вийти з сайту
          </button>
        </div>
      </div>
    </div>
  )
}

/** Постійний вузький напис угорі сторінки. */
export function DisclaimerBar() {
  return (
    <div className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
      Приватний любительський експеримент, створений за допомогою ШІ. Не для поширення, комерційного використання чи продажу.
    </div>
  )
}
