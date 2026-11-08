import { DICHOTOMY_LABELS, QUADRAS, findSociotype } from '../data/sociotypes'
import type { Dichotomies } from '../data/types'
import { Card, Chip, SourceTag, type Source } from './ui'

type Key = keyof Dichotomies

const ROWS: { key: Key; title: string; options: [string, string]; hints: [string, string]; source: Source }[] = [
  { key: 'ei', title: '1. Екстраверсія / інтроверсія', options: ['extravert', 'introvert'],
    hints: ['Іде в контакт першим, говорить вголос, енергію бере від людей і дій.', 'Спершу обдумує, говорить стримано, енергію бере від тиші й свого простору.'], source: 'Моє' },
  { key: 'lf', title: '2. Логіка / етика', options: ['logic', 'ethic'],
    hints: ['Оцінює за фактами, логікою й порядком.', 'Оцінює за ставленням, емоціями й атмосферою між людьми.'], source: 'Моє' },
  { key: 'sn', title: '3. Сенсорика / інтуїція', options: ['sensing', 'intuition'],
    hints: ['Спирається на відчуття, речі й конкретний досвід «тут і зараз».', 'Спирається на ідеї, передчуття й можливі наслідки.'], source: 'Моє' },
  { key: 'rp', title: '4. Раціональність / ірраціональність', options: ['rational', 'irrational'],
    hints: ['Планує, ухвалює рішення й закриває питання.', 'Діє за обставинами й залишає варіанти відкритими.'], source: 'Моє' },
]

interface Props {
  value: Partial<Dichotomies>
  onChange: (next: Partial<Dichotomies>) => void
  onOpenProfile: () => void
}

export function DichotomyPicker({ value, onChange, onOpenProfile }: Props) {
  const type = findSociotype(value)
  const chosen = Object.values(value).filter(Boolean).length

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Оберіть чотири дихотомії</h2>
          <button
            type="button"
            onClick={() => onChange({})}
            disabled={chosen === 0}
            className="text-sm text-stone-500 underline-offset-2 hover:underline disabled:opacity-40 dark:text-stone-400"
          >
            Скинути
          </button>
        </div>
        <div className="space-y-4">
          {ROWS.map((row) => (
            <div key={row.key}>
              <div className="mb-1.5 text-sm font-medium text-stone-600 dark:text-stone-300">{row.title}</div>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label={row.title}>
                {row.options.map((opt) => {
                  const active = value[row.key] === opt
                  const label = (DICHOTOMY_LABELS[row.key] as Record<string, string>)[opt]
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange({ ...value, [row.key]: opt })}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                        active
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-stone-300 bg-white text-stone-700 hover:border-indigo-400 dark:border-stone-600 dark:bg-stone-900/40 dark:text-stone-200'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs leading-snug text-stone-600 dark:text-stone-300">
                <p>{row.hints[0]}</p>
                <p>{row.hints[1]}</p>
              </div>
              <SourceTag s={row.source} className="!mt-0.5" />
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
          Вибір можна змінювати в будь-який момент: соціотип оновлюється одразу, без перезавантаження сторінки.
        </p>
        <SourceTag s="Аугустінавічюте" />
      </Card>

      <Card className="flex flex-col justify-center">
        {type ? (
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-sm font-bold tracking-wider text-white">{type.code}</span>
              <Chip tone="accent">Квадра {QUADRAS[type.quadra].name}</Chip>
            </div>
            <h2 className="text-2xl font-semibold">{type.nickname}</h2>
            <p className="text-stone-600 dark:text-stone-300">{type.name}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-200">{type.summary}</p>
            <SourceTag s="Аугустінавічюте" />
            <button
              type="button"
              onClick={onOpenProfile}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Відкрити повний профіль
            </button>
          </div>
        ) : (
          <div className="text-center text-stone-500 dark:text-stone-400">
            <div className="text-4xl">{chosen}/4</div>
            <p className="mt-2 text-sm">Оберіть ще {4 - chosen} {4 - chosen === 1 ? 'дихотомію' : 'дихотомії'}, і сайт визначить соціотип.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
