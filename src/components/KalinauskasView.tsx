import { ASPECTS } from '../data/aspects'
import { CONTEXTS, CONTEXT_IDS } from '../data/contexts'
import { CONTEXT_EXAMPLES } from '../data/contextExamples'
import { K_FUNCTIONS, K_FUNCTION_IDS, KAL_CELLS, elementKind, kModel } from '../data/kal'
import type { KFunctionId } from '../data/kal/cellTypes'
import type { ContextId, Sociotype } from '../data/types'
import { useContextTheses } from '../lib/contextTheses'
import { usePersistentState } from '../lib/persist'
import { Card, Chip, CopyButton, SourceTag, ThesisList } from './ui'

interface Props {
  type: Sociotype
  fn: KFunctionId
  onChange: (f: KFunctionId) => void
}

export function KalinauskasView({ type, fn, onChange }: Props) {
  const model = kModel(type)
  const aspect = ASPECTS[model[fn]]
  const info = K_FUNCTIONS[fn]
  const cell = KAL_CELLS[aspect.code][fn]

  const [ctx, setCtx] = usePersistentState<ContextId | 'general'>(
    'socio-kal-context',
    'general',
    (v) => v === 'general' || (typeof v === 'string' && (CONTEXT_IDS as string[]).includes(v)),
  )
  const real = ctx === 'general' ? null : ctx
  const plusState = useContextTheses(real ? { aspect: aspect.code, fn, reaction: 'plus', context: real } : null)
  const minusState = useContextTheses(real ? { aspect: aspect.code, fn, reaction: 'minus', context: real } : null)
  const plusItems = plusState.status === 'ok' ? plusState.items : cell.plus
  const minusItems = minusState.status === 'ok' ? minusState.items : cell.minus
  const example = real ? CONTEXT_EXAMPLES[aspect.code][real] : null
  const note = (st: typeof plusState) =>
    !real ? null : st.status === 'loading' ? (
      <p role="status" className="mb-2 text-xs text-stone-500 dark:text-stone-400">Складаю тези для контексту «{CONTEXTS[real].name}»… Поки що показано загальні.</p>
    ) : st.status === 'error' ? (
      <p role="status" className="mb-2 text-xs text-amber-800 dark:text-amber-300">Тези для контексту «{CONTEXTS[real].name}» недоступні ({st.message}). Показано загальні.</p>
    ) : null

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Чотири функції за Калінаускасом · {type.code} · {type.nickname}</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          У системі Калінаускаса в людини чотири функції; кожна має «формулу» — що людина робить з інформацією аспекту. Плюсовий чи мінусовий сигнал
          на функцію викликає описану реакцію.
        </p>
        <SourceTag s="Калінаускас" />
      </Card>

      <div role="tablist" aria-label="Функції за Калінаускасом">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {K_FUNCTION_IDS.map((f) => {
            const active = f === fn
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(f)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-stone-300 bg-white hover:border-indigo-400 dark:border-stone-600 dark:bg-stone-800'
                }`}
              >
                <div className="font-mono text-xs font-bold">{f} · {model[f]}</div>
                <div className={`text-xs ${active ? 'text-indigo-100' : 'text-stone-500 dark:text-stone-400'}`}>{K_FUNCTIONS[f].name}</div>
              </button>
            )
          })}
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-indigo-600 px-2 py-0.5 font-mono text-sm font-bold text-white">{aspect.code}</span>
          <Chip tone="accent">{info.name}</Chip>
          <Chip>{elementKind(aspect.code)} елемент</Chip>
        </div>
        <h3 className="mt-2 text-lg font-semibold">{aspect.name}</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="font-medium">Формула функції</dt>
            <dd className="text-stone-700 dark:text-stone-200">Людина {info.formula}.</dd>
          </div>
          <div>
            <dt className="font-medium">При мінусовому сигналі</dt>
            <dd className="text-stone-700 dark:text-stone-200">{info.minusSign}</dd>
          </div>
        </dl>
        <SourceTag s="Калінаускас" />
        <div className="mt-4 rounded-lg bg-stone-50 p-3 text-sm leading-relaxed dark:bg-stone-900/40">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Як це проявляється в аспекті {aspect.code} на цій функції
          </div>
          {cell.summary}
          <SourceTag s="Калінаускас" />
        </div>
        <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          У моделі А ця функція займає позицію {info.modelAPosition} («{info.modelAPosition === 1 ? 'Базова' : info.modelAPosition === 2 ? 'Творча' : info.modelAPosition === 6 ? 'Больова' : 'Сугестивна'}»
          за порядком, перевіреним на всіх 16 типах за таблицями автора).
        </p>
      </Card>

      <Card>
        <div className="mb-2 text-sm font-medium">Контекст спілкування</div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Контекст спілкування">
          {(['general', ...CONTEXT_IDS] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={ctx === c}
              onClick={() => setCtx(c)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                ctx === c
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-stone-300 bg-white hover:border-indigo-400 dark:border-stone-600 dark:bg-stone-900/40'
              }`}
            >
              {c === 'general' ? 'Загальні' : CONTEXTS[c].name}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <section aria-label="Тези плюс" className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-emerald-800 dark:text-emerald-300">ПЛЮС (+) · 10 тез</h3>
            <CopyButton text={plusItems.map((t, i) => `${i + 1}. ${t}`).join('\n')} label="Копіювати всі" />
          </div>
          {note(plusState)}
          {example && <p className="mb-2 rounded-lg bg-white/70 p-2.5 text-sm dark:bg-stone-900/30"><span className="font-medium">Приклад: </span>{example.plus}</p>}
          <ThesisList items={plusItems} tone="plus" />
          <SourceTag s={real && plusState.status === 'ok' ? 'ШІ' : 'Моє'} />
        </section>
        <section aria-label="Тези мінус" className="rounded-xl border border-rose-300 bg-rose-50/60 p-4 dark:border-rose-800 dark:bg-rose-950/20">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-rose-800 dark:text-rose-300">МІНУС (−) · 10 тез</h3>
            <CopyButton text={minusItems.map((t, i) => `${i + 1}. ${t}`).join('\n')} label="Копіювати всі" />
          </div>
          {note(minusState)}
          {example && <p className="mb-2 rounded-lg bg-white/70 p-2.5 text-sm dark:bg-stone-900/30"><span className="font-medium">Приклад: </span>{example.minus}</p>}
          <ThesisList items={minusItems} tone="minus" />
          <SourceTag s={real && minusState.status === 'ok' ? 'ШІ' : 'Моє'} />
        </section>
      </div>

      <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
        Опис функції взято з книги Калінаускаса; самі формулювання тез — мої, складені з урахуванням його розбору аспекту. Вони не є цитатами й не
        гарантують реакції конкретної людини.
      </p>
    </div>
  )
}
