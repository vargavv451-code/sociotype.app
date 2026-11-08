import { SOCIOTYPES } from '../data/sociotypes'
import type { SavedItem } from '../lib/saved'
import type { TypeCode } from '../data/types'
import { Card, EmptyState } from './ui'

interface Props {
  items: SavedItem[]
  current: TypeCode | null
  onOpen: (c: TypeCode, tab: 'profile' | 'triggers') => void
  onNote: (c: TypeCode, note: string) => void
  onRemove: (c: TypeCode) => void
  onPick: () => void
}

export function SavedView({ items, current, onOpen, onNote, onRemove, onPick }: Props) {
  if (items.length === 0) {
    return (
      <EmptyState
        message="Тут буде список збережених соціотипів. Відкрийте тип і натисніть «☆ Зберегти»."
        action="Обрати соціотип"
        onAction={onPick}
      />
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600 dark:text-stone-300">
        Список і нотатки зберігаються лише на цьому пристрої, у цьому браузері. Нотатки — ваші власні записи.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => {
          const t = SOCIOTYPES[it.code]
          return (
            <li key={it.code}>
              <Card className={current === it.code ? 'ring-2 ring-indigo-500' : ''}>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-lg font-bold">{it.code}</span>
                  <span className="min-w-0 break-words font-semibold">{t.nickname}</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">{t.name} · квадра {t.quadra}</p>
                <label className="mt-3 block text-sm">
                  <span className="mb-1 block font-medium">Нотатка</span>
                  <textarea
                    value={it.note}
                    onChange={(e) => onNote(it.code, e.target.value)}
                    rows={3}
                    maxLength={600}
                    placeholder="Наприклад: з ким це порівнюю, що перевірити…"
                    className="w-full resize-y rounded-lg border border-stone-300 bg-white p-2 text-base sm:text-sm dark:border-stone-600 dark:bg-stone-900/40"
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onOpen(it.code, 'profile')} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                    Профіль
                  </button>
                  <button type="button" onClick={() => onOpen(it.code, 'triggers')} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700">
                    Функції й реакції
                  </button>
                  <button type="button" onClick={() => onRemove(it.code)} className="ml-auto rounded-lg px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30">
                    Видалити
                  </button>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
