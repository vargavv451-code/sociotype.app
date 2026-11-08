import { Fragment, useState } from 'react'
import { K_FUNCTION_IDS, K_FUNCTIONS } from '../data/kal'
import type { KFunctionId } from '../data/kal/cellTypes'
import { POSITION_IDS } from '../data/positions'
import type { PositionId, Sociotype } from '../data/types'
import { getEntry } from '../lib/model'
import { Card, Chip, SourceTag } from './ui'

interface Props {
  type: Sociotype
  onOpenKal: (f: KFunctionId) => void
}

export function ModelAView({ type, onOpenKal }: Props) {
  const [open, setOpen] = useState<PositionId | null>(null)

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">
          Модель А · {type.code} · {type.nickname}
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          8 функцій типу: що стоїть на якому місці й що це означає. Натисніть на рядок.
        </p>
        <SourceTag s="Вікіпедія" />
      </Card>

      <Card className="overflow-hidden p-0 sm:p-0">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/40 dark:text-stone-400">
            <tr>
              <th className="w-9 px-2 py-2.5 sm:w-12 sm:px-3">№</th>
              <th className="w-28 px-2 py-2.5 sm:w-48 sm:px-3">Функція</th>
              <th className="px-2 py-2.5 sm:px-3">Позиція · ключ</th>
            </tr>
          </thead>
          <tbody>
            {POSITION_IDS.map((pid) => {
              const e = getEntry(type, pid)
              const isOpen = open === pid
              return (
                <Fragment key={pid}>
                  <tr
                    className={`cursor-pointer border-t border-stone-200 transition hover:bg-indigo-50/60 dark:border-stone-700 dark:hover:bg-stone-700/50 ${isOpen ? 'bg-indigo-50 dark:bg-stone-700/60' : ''}`}
                    onClick={() => setOpen(isOpen ? null : pid)}
                  >
                    <td className="px-2 py-3 font-semibold sm:px-3">{pid}</td>
                    <td className="px-2 py-3 sm:px-3">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        className="rounded-md bg-indigo-600 px-2 py-0.5 font-mono text-xs font-bold text-white"
                        onClick={(ev) => { ev.stopPropagation(); setOpen(isOpen ? null : pid) }}
                      >
                        {e.aspect.code}
                      </button>
                      <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{e.aspect.short}</div>
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <div className="font-medium">{e.position.name}</div>
                      <div className="mt-0.5 text-stone-700 dark:text-stone-200">{e.position.key}</div>
                      <div className="mt-1">
                        <Chip tone={e.position.strength === 'Сильна' ? 'plus' : 'neutral'}>{e.position.strength}</Chip>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-indigo-50/40 dark:bg-stone-900/30">
                      <td colSpan={3} className="px-3 py-4">
                        <p className="text-sm leading-relaxed">{e.position.simple}</p>
                        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                          {e.position.block} · {e.position.conscious ? 'усвідомлювана' : 'неусвідомлювана'}
                        </p>
                        <SourceTag s="Моє" />
                        {(() => {
                          const kf = K_FUNCTION_IDS.find((f) => K_FUNCTIONS[f].modelAPosition === pid)
                          return kf ? (
                            <button
                              type="button"
                              onClick={() => onOpenKal(kf)}
                              className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                              Показати функцію за Калінаускасом і 10 тез (+) / 10 тез (−)
                            </button>
                          ) : (
                            <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">Для цієї позиції тез немає: у Калінаускаса їх не описано.</p>
                          )
                        })()}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
