import { ASPECT_CODES, ASPECTS } from '../data/aspects'
import { CONTEXTS, CONTEXT_IDS } from '../data/contexts'
import { K_FUNCTIONS, KAL_CELLS } from '../data/kal'
import type { KFunctionId } from '../data/kal/cellTypes'
import type { AspectCode, ContextId, Reaction } from '../data/types'

export interface ThesesRequest {
  aspect: AspectCode
  fn: KFunctionId
  reaction: Reaction
  context: ContextId
}

export function parseThesesRequest(x: unknown): ThesesRequest | null {
  if (!x || typeof x !== 'object') return null
  const b = x as Record<string, unknown>
  if (typeof b.aspect !== 'string' || !(ASPECT_CODES as string[]).includes(b.aspect)) return null
  if (![1, 2, 3, 4].includes(b.fn as number)) return null
  if (b.reaction !== 'plus' && b.reaction !== 'minus') return null
  if (typeof b.context !== 'string' || !(CONTEXT_IDS as string[]).includes(b.context)) return null
  return { aspect: b.aspect as AspectCode, fn: b.fn as KFunctionId, reaction: b.reaction, context: b.context as ContextId }
}

export const thesesCacheKey = (r: ThesesRequest) => `th1:${r.aspect}:${r.fn}:${r.reaction}:${r.context}`

export const THESES_SYSTEM = [
  'Ти складаєш тези для інтерактивного довідника соціоніки за логікою Ігоря Калінаускаса. Пиши українською.',
  'Теза — коротка конкретна фраза (до 110 символів) про слова, дію чи ситуацію, яка може викликати емоційну реакцію. Плюс і мінус — це можлива емоційна реакція, а не оцінка людини.',
  'Правила: спирайся на наданий опис Калінаускаса; не вигадуй фактів і не подавай припущення як підтверджені закономірності; не давай порад і висновків; тези мають бути різними між собою й конкретно прив’язаними до заданого контексту спілкування, а не загальними.',
  'Поверни лише JSON-масив рівно з 10 рядків без пояснень і без markdown.',
].join('\n')

export function buildThesesUser(r: ThesesRequest): string {
  const a = ASPECTS[r.aspect]
  const f = K_FUNCTIONS[r.fn]
  const cell = KAL_CELLS[r.aspect][r.fn]
  const c = CONTEXTS[r.context]
  return [
    `Аспект: ${a.name}.`,
    `Функція за Калінаускасом: ${f.name} (людина ${f.formula}). При мінусовому сигналі: ${f.minusSign}`,
    `Опис цього аспекту на цій функції (Калінаускас): ${cell.summary}`,
    `Реакція, для якої потрібні тези: ${r.reaction === 'plus' ? 'ПЛЮС (+): що може викликати позитивні емоції' : 'МІНУС (−): що може викликати негативні емоції'}.`,
    `Контекст спілкування: ${c.name}. ${c.description} ${r.reaction === 'plus' ? c.plusLens : c.minusLens}`,
    `Приклади загальних тез для цієї реакції (стиль і зміст; перепиши під контекст, не копіюй дослівно):\n${cell[r.reaction].map((t) => `- ${t}`).join('\n')}`,
  ].join('\n\n')
}

export function parseTheses(text: string): string[] | null {
  const a = text.indexOf('[')
  const b = text.lastIndexOf(']')
  if (a < 0 || b <= a) return null
  let arr: unknown
  try {
    arr = JSON.parse(text.slice(a, b + 1))
  } catch {
    return null
  }
  if (!Array.isArray(arr) || arr.length !== 10) return null
  const out = arr.map((x) => (typeof x === 'string' ? x.trim() : ''))
  if (out.some((x) => x.length < 5 || x.length > 200)) return null
  if (new Set(out).size !== 10) return null
  return out
}
