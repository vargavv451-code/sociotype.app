import { useMemo, useState } from 'react'
import { SOCIOTYPES, TYPE_CODES } from '../data/sociotypes'
import type { TypeCode } from '../data/types'

interface Props {
  dark: boolean
  onToggleTheme: () => void
  onPick: (c: TypeCode) => void
}

export function Header({ dark, onToggleTheme, onPick }: Props) {
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return TYPE_CODES.filter((c) => {
      const t = SOCIOTYPES[c]
      return c.toLowerCase().includes(s) || t.nickname.toLowerCase().includes(s) || t.name.toLowerCase().includes(s)
    })
  }, [q])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="mr-auto">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Довідник соціоніки</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">16 соціотипів · модель А · емоційні реакції (+/−)</p>
      </div>
      <div className="relative w-full sm:w-72">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => window.setTimeout(() => setFocus(false), 150)}
          placeholder="Пошук: IEE, Гекслі, інтуїтивно…"
          aria-label="Пошук за соціотипом"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
        />
        {focus && q.trim() && (
          <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-stone-200 bg-white shadow-lg dark:border-stone-600 dark:bg-stone-800">
            {results.length === 0 && <li className="px-3 py-2 text-sm text-stone-500">Нічого не знайдено</li>}
            {results.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onPick(c); setQ(''); setFocus(false) }}
                  className="flex w-full items-baseline gap-2 px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-stone-700"
                >
                  <span className="font-mono font-bold">{c}</span>
                  <span>{SOCIOTYPES[c].nickname}</span>
                  <span className="ml-auto truncate text-xs text-stone-500">{SOCIOTYPES[c].name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-pressed={dark}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
      >
        {dark ? 'Світла тема' : 'Темна тема'}
      </button>
    </div>
  )
}
