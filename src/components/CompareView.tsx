import { ASPECTS } from '../data/aspects'
import { K_FUNCTIONS } from '../data/kal'
import { SOCIOTYPES, TYPE_CODES } from '../data/sociotypes'
import type { TypeCode } from '../data/types'
import { dichotomyRows, dualOf, functionRows, sameDichotomyCount } from '../lib/compare'
import { Card, Chip, SourceTag } from './ui'

interface Props {
  main: TypeCode | null
  onMain: (c: TypeCode | null) => void
  /** Тип, відкритий зараз в інших розділах */
  other: TypeCode | null
  onOther: (c: TypeCode) => void
}

const selectCls = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base sm:text-sm dark:border-stone-600 dark:bg-stone-900/40'

function TypeSelect({ label, value, onChange, empty }: { label: string; value: TypeCode | null; onChange: (c: TypeCode | null) => void; empty?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <select className={selectCls} value={value ?? ''} onChange={(e) => onChange((e.target.value || null) as TypeCode | null)}>
        {empty && <option value="">{empty}</option>}
        {!empty && !value && <option value="">Оберіть тип</option>}
        {TYPE_CODES.map((c) => (
          <option key={c} value={c}>{c} · {SOCIOTYPES[c].nickname}</option>
        ))}
      </select>
    </label>
  )
}

export function CompareView({ main, onMain, other, onOther }: Props) {
  const mainType = main ? SOCIOTYPES[main] : null
  const otherType = other ? SOCIOTYPES[other] : null
  const dual = mainType ? dualOf(mainType) : null

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Порівняння з основним соціотипом</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Оберіть основний соціотип профілю. Він потрібен лише в цьому розділі: у «Профілі», «Функціях», «Комунікації» й «Моделі А» описи всіх типів лишаються однаковими.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TypeSelect label="Основний соціотип (лише один)" value={main} onChange={onMain} empty="Не обрано" />
          <TypeSelect label="Порівняти з" value={other} onChange={(c) => c && onOther(c)} />
        </div>
        {main && (
          <button type="button" onClick={() => onMain(null)} className="mt-2 text-xs text-stone-500 underline-offset-2 hover:underline dark:text-stone-400">
            Скинути основний тип
          </button>
        )}
      </Card>

      {!mainType && (
        <Card className="text-sm text-stone-600 dark:text-stone-300">
          {other ? (
            <div className="flex flex-wrap items-center gap-3">
              <span>Зробити основним тип <strong>{other} · {SOCIOTYPES[other].nickname}</strong>?</span>
              <button type="button" onClick={() => onMain(other)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                Зробити основним
              </button>
            </div>
          ) : (
            'Оберіть основний соціотип угорі, щоб порівнювати з ним інші.'
          )}
        </Card>
      )}

      {mainType && dual && (
        <Card>
          <h3 className="font-semibold">Дуальність</h3>
          <p className="mt-1 text-sm">
            Дуал типу <strong>{mainType.code} · {mainType.nickname}</strong>: <strong>{dual.code} · {dual.nickname}</strong>.
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            У дуала протилежні три дихотомії (екстра-/інтроверсія, логіка/етика, сенсорика/інтуїція), раціональність однакова. Базова функція дуала ({dual.model[1]}) стоїть у моделі А основного типу на 5-й позиції, творча ({dual.model[2]}) — на 6-й.
          </p>
          <SourceTag s="Аугустінавічюте" />
          {otherType?.code !== dual.code && (
            <button type="button" onClick={() => onOther(dual.code)} className="mt-2 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700">
              Порівняти з дуалом
            </button>
          )}
        </Card>
      )}

      {mainType && otherType && dual && (
        <>
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{mainType.code} ↔ {otherType.code}</h3>
              {otherType.code === mainType.code && <Chip tone="accent">Той самий тип</Chip>}
              {otherType.code === dual.code && <Chip tone="plus">Дуал основного типу</Chip>}
              {otherType.quadra === mainType.quadra && <Chip>Одна квадра</Chip>}
            </div>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
              Збігаються {sameDichotomyCount(mainType, otherType)} із 4 дихотомій.
            </p>
            <div className="mt-3 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500 dark:bg-stone-900/40 dark:text-stone-400">
                  <tr>
                    <th className="px-2 py-2 sm:px-3">Дихотомія</th>
                    <th className="w-24 px-2 py-2 sm:w-32 sm:px-3">Основний</th>
                    <th className="w-24 px-2 py-2 sm:w-32 sm:px-3">Інший</th>
                  </tr>
                </thead>
                <tbody>
                  {dichotomyRows(mainType, otherType).map((r) => (
                    <tr key={r.title} className="border-t border-stone-200 dark:border-stone-700">
                      <td className="break-words px-2 py-2 text-xs sm:px-3 sm:text-sm">{r.title}</td>
                      <td className="px-2 py-2 sm:px-3">{r.main}</td>
                      <td className="px-2 py-2 sm:px-3">
                        {r.other}
                        <span className={`ml-1 text-xs font-semibold ${r.same ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                          {r.same ? '= збігається' : '≠ різниться'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SourceTag s="Моє" />
          </Card>

          <Card>
            <h3 className="font-semibold">Функції за Калінаускасом</h3>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
              Який аспект стоїть на кожній із чотирьох функцій і де в іншого типу опиняється аспект основного.
            </p>
            <ul className="mt-3 space-y-3">
              {functionRows(mainType, otherType).map((r) => (
                <li key={r.fn} className="rounded-lg border border-stone-200 p-3 text-sm dark:border-stone-700">
                  <p className="font-medium">{r.fn}. {K_FUNCTIONS[r.fn].name}</p>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <dt className="text-stone-500 dark:text-stone-400">Основний</dt>
                    <dd><span className="font-mono font-bold">{r.mainAspect}</span> · {ASPECTS[r.mainAspect].short}</dd>
                    <dt className="text-stone-500 dark:text-stone-400">Інший</dt>
                    <dd>
                      <span className="font-mono font-bold">{r.otherAspect}</span> · {ASPECTS[r.otherAspect].short}
                      {r.sameAspect && <span className="ml-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">= той самий аспект</span>}
                    </dd>
                    {!r.sameAspect && (
                      <>
                        <dt className="text-stone-500 dark:text-stone-400">Аспект основного в іншого</dt>
                        <dd>позиція {r.mainAspectInOther.position} · {r.mainAspectInOther.name} ({r.mainAspectInOther.strength.toLowerCase()})</dd>
                      </>
                    )}
                  </dl>
                </li>
              ))}
            </ul>
            <SourceTag s="Моє" />
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              Таблиці побудовані з даних довідника (функції за Калінаускасом і модель А). Це порівняння структури типів, а не прогноз стосунків.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
