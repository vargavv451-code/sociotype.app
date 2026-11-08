import { ASPECTS } from '../data/aspects'
import { elementOf } from '../data/kal/elements'
import { K_FUNCTION_IDS, K_FUNCTIONS, KAL_CELLS, elementKind, kModel } from '../data/kal'
import { POSITIONS, POSITION_IDS } from '../data/positions'
import { SOCIOTYPES, TYPE_CODES } from '../data/sociotypes'
import type { AspectCode, TypeCode } from '../data/types'
import { usePersistentState } from '../lib/persist'
import { Card, Chip, SourceTag } from './ui'

const ORDER: AspectCode[] = ['Ne', 'Ni', 'Se', 'Si', 'Te', 'Ti', 'Fe', 'Fi']

function TypeChips({ codes, onPick }: { codes: TypeCode[]; onPick: (c: TypeCode) => void }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {codes.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          className="rounded-md border border-stone-300 px-1.5 py-0.5 font-mono text-xs font-semibold hover:border-indigo-500 dark:border-stone-600"
          title={SOCIOTYPES[c].nickname}
        >
          {c}
        </button>
      ))}
    </span>
  )
}

export function AspectsView({ onPick }: { onPick: (c: TypeCode) => void }) {
  const [code, setCode] = usePersistentState<AspectCode>('socio-aspect', 'Ne', (v) => typeof v === 'string' && (ORDER as string[]).includes(v))
  const a = ASPECTS[code]
  const el = elementOf(code)
  const form = a.code[1] === 'e' ? 'object' : 'subject'
  const withAspect = (pred: (c: TypeCode) => boolean) => TYPE_CODES.filter(pred)

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Аспекти: докладніше</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Вісім аспектів інформації. Оберіть аспект, щоб побачити, що він означає, як проявляється на кожній із чотирьох функцій і в яких типів де стоїть.
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Аспекти">
          {ORDER.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={code === c}
              onClick={() => setCode(c)}
              className={`rounded-lg border px-3 py-1.5 font-mono text-sm font-bold transition ${
                code === c ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-stone-300 hover:border-indigo-500 dark:border-stone-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{a.code} · {a.short}</h3>
          <Chip tone="accent">{elementKind(a.code)} елемент</Chip>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{a.name}</p>

        <h4 className="mt-4 text-sm font-semibold">Що це за аспект ({el.title.toLowerCase()}) за Калінаускасом</h4>
        <p className="mt-1 text-sm leading-relaxed">{el.nature}</p>
        <p className="mt-1 text-sm leading-relaxed">
          <strong>{form === 'object' ? 'Об’єктна форма' : 'Суб’єктна форма'}:</strong> {el[form]}
        </p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Для порівняння: {form === 'object' ? 'суб’єктна' : 'об’єктна'} форма — {el[form === 'object' ? 'subject' : 'object'].charAt(0).toLowerCase() + el[form === 'object' ? 'subject' : 'object'].slice(1)}
        </p>
        <SourceTag s="Калінаускас" />

        <h4 className="mt-4 text-sm font-semibold">Простими словами</h4>
        <p className="mt-1 text-sm leading-relaxed">{a.description}</p>
        <p className="mt-2 flex flex-wrap gap-1.5">
          {a.keywords.map((k) => <Chip key={k}>{k}</Chip>)}
        </p>
        <SourceTag s="Моє" />
      </Card>

      <Card>
        <h3 className="font-semibold">Як аспект проявляється на кожній функції</h3>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Калінаускас розбирає кожен аспект окремо на чотирьох функціях. Нижче — переказ розбору та типи, у яких аспект стоїть на цій функції.
        </p>
        <ul className="mt-3 space-y-2">
          {K_FUNCTION_IDS.map((f) => {
            const info = K_FUNCTIONS[f]
            const holders = withAspect((c) => kModel(SOCIOTYPES[c])[f] === code)
            return (
              <li key={f}>
                <details className="rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                  <summary className="cursor-pointer text-sm font-medium">
                    {f}-а функція · {info.name}
                    <span className="ml-2 font-normal text-stone-500 dark:text-stone-400">({info.formula})</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed">{KAL_CELLS[code][f].summary}</p>
                  <SourceTag s="Калінаускас" />
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-stone-500 dark:text-stone-400">Стоїть на цій функції в типів:</span>
                    <TypeChips codes={holders} onPick={onPick} />
                  </p>
                </details>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        <h3 className="font-semibold">Де аспект стоїть у моделі А</h3>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Для кожної позиції — типи, у яких цей аспект на цьому місці. Довідково, за класичною моделлю А.
        </p>
        <ul className="mt-3 divide-y divide-stone-200 dark:divide-stone-700">
          {POSITION_IDS.map((p) => {
            const holders = withAspect((c) => SOCIOTYPES[c].model[p] === code)
            return (
              <li key={p} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <span className="w-6 font-semibold">{p}</span>
                <span className="min-w-0 flex-1 basis-40">
                  {POSITIONS[p].name}
                  <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">({POSITIONS[p].strength.toLowerCase()})</span>
                </span>
                <TypeChips codes={holders} onPick={onPick} />
              </li>
            )
          })}
        </ul>
        <SourceTag s="Моє" />
        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Список складено з даних довідника (модель А виводиться правилом із базової й творчої функцій).</p>
      </Card>
    </div>
  )
}

