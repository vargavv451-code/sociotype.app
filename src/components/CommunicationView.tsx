import { useMemo, useState } from 'react'
import { CONTEXTS, CONTEXT_IDS } from '../data/contexts'
import { CONTEXT_EXAMPLES } from '../data/contextExamples'
import { ASPECTS } from '../data/aspects'
import { K_FUNCTIONS, K_FUNCTION_IDS, KAL_CELLS, kModel } from '../data/kal'
import type { KFunctionId } from '../data/kal/cellTypes'
import { SOCIOTYPES, TYPE_CODES } from '../data/sociotypes'
import type { ContextId, Reaction, TypeCode } from '../data/types'
import { TONE_LABEL, analyzeMessage, type Verdict } from '../lib/analyzer'
import { track } from '../lib/track'
import { Card, Chip, CopyButton, SourceTag, ThesisList } from './ui'

interface Props {
  typeCode: TypeCode | null
  onTypeChange: (c: TypeCode) => void
  fn: KFunctionId
  onFnChange: (f: KFunctionId) => void
}

const selectCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900/40'

export function CommunicationView({ typeCode, onTypeChange, fn, onFnChange }: Props) {
  const [reaction, setReaction] = useState<Reaction>('plus')
  const [context, setContext] = useState<ContextId>('acquaintance')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState('')

  const type = typeCode ? SOCIOTYPES[typeCode] : null
  const aspectCode = type ? kModel(type)[fn] : null
  const entry = aspectCode ? { aspect: ASPECTS[aspectCode], info: K_FUNCTIONS[fn], cell: KAL_CELLS[aspectCode][fn] } : null
  const ctx = CONTEXTS[context]
  const example = entry ? CONTEXT_EXAMPLES[entry.aspect.code][context] : null
  const theses = entry ? entry.cell[reaction] : []

  const analysis = useMemo(() => (submitted ? analyzeMessage(submitted, type) : []), [submitted, type])
  const buckets = useMemo(() => {
    const by: Record<Verdict, typeof analysis> = { plus: [], minus: [], mixed: [], neutral: [] }
    for (const c of analysis) {
      if (c.aspects.length === 0) by.neutral.push(c)
      else {
        const hasMinus = c.aspects.some((a) => a.verdict === 'minus')
        const hasPlus = c.aspects.some((a) => a.verdict === 'plus')
        const hasMixed = c.aspects.some((a) => a.verdict === 'mixed')
        if (hasMinus) by.minus.push(c)
        else if (hasPlus) by.plus.push(c)
        else if (hasMixed) by.mixed.push(c)
        else by.neutral.push(c)
      }
    }
    return by
  }, [analysis])

  const touched = useMemo(() => {
    const set = new Map<string, { code: string; kfunction?: KFunctionId }>()
    for (const c of analysis) for (const a of c.aspects) set.set(a.aspect, { code: a.aspect, kfunction: a.kfunction })
    return [...set.values()]
  }, [analysis])

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Що може викликати реакцію</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Соціотип</span>
            <select className={selectCls} value={typeCode ?? ''} onChange={(e) => onTypeChange(e.target.value as TypeCode)}>
              <option value="" disabled>Оберіть соціотип</option>
              {TYPE_CODES.map((c) => (
                <option key={c} value={c}>{c} · {SOCIOTYPES[c].nickname}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Функція</span>
            <select
              className={selectCls}
              value={fn}
              disabled={!type}
              onChange={(e) => onFnChange(Number(e.target.value) as KFunctionId)}
            >
              {K_FUNCTION_IDS.map((f) => (
                <option key={f} value={f}>
                  {f}. {type ? `${kModel(type)[f]} · ${K_FUNCTIONS[f].name}` : 'Оберіть соціотип'}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1 block text-sm font-medium">Реакція</span>
            <div className="grid grid-cols-2 gap-2">
              {(['plus', 'minus'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={reaction === r}
                  onClick={() => setReaction(r)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    reaction === r
                      ? r === 'plus' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-rose-600 bg-rose-600 text-white'
                      : 'border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-900/40'
                  }`}
                >
                  {r === 'plus' ? 'Плюс (+)' : 'Мінус (−)'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Контекст</span>
            <div className="flex flex-wrap gap-2">
              {CONTEXT_IDS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={context === c}
                  onClick={() => setContext(c)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    context === c
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-stone-300 bg-white hover:border-indigo-400 dark:border-stone-600 dark:bg-stone-900/40'
                  }`}
                >
                  {CONTEXTS[c].name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {entry && type && example ? (
        <Card className={reaction === 'plus' ? 'border-emerald-300 dark:border-emerald-800' : 'border-rose-300 dark:border-rose-800'}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Chip tone={reaction}>{reaction === 'plus' ? 'Плюс (+)' : 'Мінус (−)'}</Chip>
            <Chip tone="accent">{ctx.name}</Chip>
            <Chip>{type.code} · {entry.aspect.code} · {entry.info.name}</Chip>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-300">{ctx.description}</p>
          <p className="mt-1 text-sm">{reaction === 'plus' ? ctx.plusLens : ctx.minusLens}</p>
          <SourceTag s="Моє" />

          <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm leading-relaxed dark:bg-indigo-950/30">
            {entry.cell.summary}
            <SourceTag s="Калінаускас" />
          </div>

          <div className="mt-4 rounded-lg bg-stone-50 p-3 text-sm dark:bg-stone-900/40">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Приклад ситуації: {ctx.name.toLowerCase()}</span>
              <CopyButton text={example[reaction]} />
            </div>
            {example[reaction]}
            <SourceTag s="Моє" />
          </div>

          <div className="mt-4 mb-2 flex items-center justify-between gap-2">
            <h3 className="font-semibold">10 тез</h3>
            <CopyButton text={theses.map((t, i) => `${i + 1}. ${t}`).join('\n')} label="Копіювати всі" />
          </div>
          <ThesisList items={theses} tone={reaction} />
          <SourceTag s="Моє" />
        </Card>
      ) : (
        <Card className="text-center text-sm text-stone-600 dark:text-stone-300">Оберіть соціотип, щоб побачити тези для обраної функції.</Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold">Аналіз власного повідомлення</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Вставте текст повідомлення. Сайт покаже, які інформаційні аспекти воно зачіпає і які фрази можуть викликати позитивну чи негативну реакцію
          {type ? <> у типу <strong>{type.code}</strong></> : <> (оберіть соціотип угорі, щоб врахувати функції за Калінаускасом)</>}.
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="Наприклад: Дякую за ідею, мені дуже цікаво її розвинути. Але ти маєш негайно надати результати."
          className="mt-3 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm dark:border-stone-600 dark:bg-stone-900/40"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!message.trim()}
            onClick={() => { setSubmitted(message.trim()); track('analyze') }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Проаналізувати
          </button>
          <button
            type="button"
            disabled={!message && !submitted}
            onClick={() => { setMessage(''); setSubmitted('') }}
            className="text-sm text-stone-500 underline-offset-2 hover:underline disabled:opacity-40 dark:text-stone-400"
          >
            Очистити
          </button>
          <span className="text-xs text-stone-500 dark:text-stone-400">{message.length}/4000</span>
        </div>

        {submitted && (
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Зачеплені інформаційні аспекти</h3>
              {touched.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">У тексті не знайдено слів, які зазвичай пов’язують з певним аспектом.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {touched.map((t) => (
                    <Chip key={t.code} tone="accent">
                      {t.code}{t.kfunction ? ` · ${t.kfunction}. ${K_FUNCTIONS[t.kfunction].name}` : ''}
                    </Chip>
                  ))}
                </div>
              )}
            </div>

            <Bucket title="Потенційно позитивні фрази" tone="plus" items={buckets.plus} />
            <Bucket title="Потенційно негативні фрази" tone="minus" items={buckets.minus} />
            <Bucket title="Неоднозначні фрази" tone="neutral" items={buckets.mixed} />
            <Bucket title="Нейтральні фрази або фрази без розпізнаного аспекту" tone="neutral" items={buckets.neutral} />

            <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              Це проста перевірка на ключові слова й тон: вона не розуміє іронії, контексту та інтонації, тож може помилятися. Результат — припущення,
              а не вимірювання й не прогноз реакції конкретної людини. Аналіз виконується в браузері, текст нікуди не надсилається.
            </p>
            <SourceTag s="Моє" />
          </div>
        )}
      </Card>
    </div>
  )
}

function Bucket({ title, tone, items }: { title: string; tone: 'plus' | 'minus' | 'neutral'; items: ReturnType<typeof analyzeMessage> }) {
  if (items.length === 0) return null
  const border = tone === 'plus' ? 'border-emerald-300 dark:border-emerald-800' : tone === 'minus' ? 'border-rose-300 dark:border-rose-800' : 'border-stone-300 dark:border-stone-600'
  const head = tone === 'plus' ? 'text-emerald-700 dark:text-emerald-300' : tone === 'minus' ? 'text-rose-700 dark:text-rose-300' : 'text-stone-700 dark:text-stone-200'
  return (
    <div>
      <h3 className={`mb-2 text-sm font-semibold ${head}`}>{title}</h3>
      <ul className="space-y-2">
        {items.map((c, i) => (
          <li key={i} className={`rounded-lg border ${border} p-3 text-sm`}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">«{c.text}»</p>
              <Chip>{TONE_LABEL[c.tone]}</Chip>
            </div>
            {c.aspects.length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                {c.aspects.map((a) => (
                  <li key={a.aspect}>
                    <span className="mr-1 rounded bg-indigo-600 px-1.5 py-0.5 font-mono font-bold text-white">{a.aspect}</span>
                    {a.note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Слів, пов’язаних з певним аспектом, не знайдено.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
