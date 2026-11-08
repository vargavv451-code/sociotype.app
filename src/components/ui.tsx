import { useEffect, useRef, useState, type ReactNode } from 'react'
import { copyText } from '../lib/clipboard'

export function CopyButton({ text, label = 'Копіювати', className = '' }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(text)
        setState(ok ? 'ok' : 'fail')
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setState('idle'), 1600)
      }}
      className={`inline-flex shrink-0 items-center rounded-md border border-stone-300 px-2 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-100 active:scale-95 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700 ${className}`}
      aria-label={label}
    >
      {state === 'ok' ? 'Скопійовано' : state === 'fail' ? 'Не вдалося' : label}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-700 dark:bg-stone-800 ${className}`}>
      {children}
    </div>
  )
}

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'plus' | 'minus' | 'accent' }) {
  const map = {
    neutral: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-200',
    plus: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    minus: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
    accent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}>{children}</span>
}

export function ThesisList({ items, tone }: { items: string[]; tone: 'plus' | 'minus' }) {
  const ring = tone === 'plus' ? 'border-emerald-200 dark:border-emerald-800' : 'border-rose-200 dark:border-rose-800'
  const num = tone === 'plus' ? 'bg-emerald-600' : 'bg-rose-600'
  return (
    <ol className="space-y-2">
      {items.map((t, i) => (
        <li key={t} className={`flex items-start gap-3 rounded-lg border ${ring} bg-white/60 p-2.5 dark:bg-stone-900/30`}>
          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${num}`}>{i + 1}</span>
          <span className="flex-1 text-sm leading-snug text-stone-800 dark:text-stone-100">{t}</span>
          <CopyButton text={t} label="Копіювати" />
        </li>
      ))}
    </ol>
  )
}

export function EmptyState({ message, action, onAction }: { message: string; action: string; onAction: () => void }) {
  return (
    <Card className="text-center">
      <p className="mb-4 text-stone-600 dark:text-stone-300">{message}</p>
      <button type="button" onClick={onAction} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        {action}
      </button>
    </Card>
  )
}

export type Source = 'Калінаускас' | 'Аугустінавічюте' | 'Процький' | 'Вікіпедія' | 'Моє' | 'ШІ'

export const SOURCE_HELP: Record<Source, string> = {
  Калінаускас: 'Викладено за книгою І. Калінаускаса «Соціоніка. Уміння спілкуватися ефективно» (перефразовано).',
  Аугустінавічюте: 'За працями Аусри Аугустінавічюте (модель А, назви типів, дуальність).',
  Процький: 'За книгою Ю. Процького «Соціоніка в 21 столітті».',
  Вікіпедія: 'За загальнодоступним описом класичної моделі А у Вікіпедії.',
  ШІ: 'Відповідь чату згенерувала мовна модель. Вона може помилятися; джерело, на яке вона спирається, названо в кінці відповіді.',
  Моє: 'Моє власне формулювання або інтерпретація без прямого джерела. Перевіряйте критично.',
}

/** Однослівна позначка походження інформації під блоком. */
export function SourceTag({ s, className = '' }: { s: Source; className?: string }) {
  const mine = s === 'Моє' || s === 'ШІ'
  return (
    <p className={`mt-2 text-xs ${className}`} data-source={s}>
      <span className="text-stone-500 dark:text-stone-400">Джерело: </span>
      <span
        title={SOURCE_HELP[s]}
        className={`rounded px-1.5 py-0.5 font-semibold ${
          mine
            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
            : 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200'
        }`}
      >
        {s}
      </span>
    </p>
  )
}

export function SourceLegend() {
  return (
    <dl className="grid gap-1.5 text-xs sm:grid-cols-2">
      {(Object.keys(SOURCE_HELP) as Source[]).map((k) => (
        <div key={k} className="flex gap-2">
          <dt className="w-32 shrink-0 font-semibold">{k}</dt>
          <dd className="text-stone-600 dark:text-stone-300">{SOURCE_HELP[k]}</dd>
        </div>
      ))}
    </dl>
  )
}
