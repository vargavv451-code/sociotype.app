import { Fragment, useState } from 'react'
import { POSITION_IDS } from '../data/positions'
import type { PositionId, Sociotype } from '../data/types'
import { getEntry } from '../lib/model'
import { K_FUNCTION_IDS, K_FUNCTIONS } from '../data/kal'
import type { KFunctionId } from '../data/kal/cellTypes'
import { Card, Chip, SourceTag } from './ui'

interface Props {
  type: Sociotype
  onOpenKal: (f: KFunctionId) => void
}

export function ModelAView({ type, onOpenKal }: Props) {
  const [open, setOpen] = useState<PositionId | null>(1)

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">
          Модель А · {type.code} · {type.nickname}
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Довідковий розділ: класична модель А з вісьмома позиціями. Основна логіка сайту — чотири функції за Калінаускасом (розділ «Функції й реакції»);
          тут показано, яким позиціям моделі А вони відповідають. Натисніть на рядок, щоб побачити детальний опис.
        </p>
        <SourceTag s="Вікіпедія" />
      </Card>

      <Card className="overflow-hidden p-0 sm:p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/40 dark:text-stone-400">
              <tr>
                <th className="px-3 py-2.5">№</th>
                <th className="px-3 py-2.5">Функція</th>
                <th className="px-3 py-2.5">Позиція</th>
                <th className="px-3 py-2.5">Сила</th>
                <th className="px-3 py-2.5">Значення</th>
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
                      <td className="px-3 py-3 font-semibold">{pid}</td>
                      <td className="px-3 py-3">
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
                      <td className="px-3 py-3">
                        <div className="font-medium">{e.position.name}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">{e.position.block}</div>
                      </td>
                      <td className="px-3 py-3">
                        <Chip tone={e.position.strength === 'Сильна' ? 'plus' : 'neutral'}>{e.position.strength}</Chip>
                      </td>
                      <td className="px-3 py-3 text-stone-700 dark:text-stone-200">{e.position.summary}</td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-indigo-50/40 dark:bg-stone-900/30">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Аспект</h4>
                              <p className="text-sm font-medium">{e.aspect.name}</p>
                              <p className="mt-1 text-sm leading-relaxed">{e.aspect.description}</p>
                              <SourceTag s="Моє" />
                            </div>
                            <div>
                              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                                Позиція «{e.position.name}»
                              </h4>
                              <p className="text-sm leading-relaxed">{e.position.detail}</p>
                              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                                {e.position.conscious ? 'Усвідомлювана' : 'Неусвідомлювана'} функція · {e.position.block}
                              </p>
                              <SourceTag s="Вікіпедія" />
                            </div>
                          </div>
                          {(() => {
                            const kf = K_FUNCTION_IDS.find((f) => K_FUNCTIONS[f].modelAPosition === pid)
                            return (
                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                {kf ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onOpenKal(kf)}
                                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                      Показати функцію за Калінаускасом і 10 тез (+) / 10 тез (−)
                                    </button>
                                    <span className="text-xs text-stone-500 dark:text-stone-400">
                                      У Калінаускаса це «{K_FUNCTIONS[kf].name}» (функція {kf}).
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs text-stone-500 dark:text-stone-400">
                                    Цієї позиції немає серед чотирьох функцій Калінаускаса, тому тез для неї на сайті немає.
                                  </span>
                                )}
                              </div>
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
        </div>
      </Card>
    </div>
  )
}
