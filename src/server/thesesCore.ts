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

export const thesesCacheKey = (r: ThesesRequest) => `th2:${r.aspect}:${r.fn}:${r.reaction}:${r.context}`

export const THESES_SYSTEM = [
  'Ти складаєш тези для інтерактивного довідника соціоніки за логікою Ігоря Калінаускаса. Пиши українською.',
  'Теза — коротка конкретна фраза (до 110 символів) про слова, дію чи ситуацію, яка може викликати емоційну реакцію. Плюс і мінус — це можлива емоційна реакція, а не оцінка людини.',
  'Правила: спирайся на наданий опис Калінаускаса; не вигадуй фактів і не подавай припущення як підтверджені закономірності; не давай порад і висновків; тези мають бути конкретно прив’язаними до заданого контексту спілкування, а не загальними.',
  'Різноманітність обов’язкова. Кожна з 10 тез має свою форму (її задано нижче за номерами) і свою окрему мікроситуацію, предмет чи деталь. Жодні дві тези не починаються з того самого слова; не будуй тези за однією схемою «дієслово у неозначеній формі + додаток». Чергуй лексику, довжину (від 40 до 110 символів), особу мовця й будову речення.',
  'Дані про аспект і приклади — лише про зміст реакції. Будову, початок і лексику прикладів не повторюй.',
  'Поверни лише JSON-масив рівно з 10 рядків без пояснень і без markdown.',
].join('\n')

export const THESIS_FORMS = [
  'пряма репліка в лапках від першої особи',
  'конкретна дія чи вчинок (опис без «сказати»)',
  'фрагмент письмового повідомлення, листа чи чату (у лапках)',
  'обставина, що склалася сама, без дії співрозмовника',
  'невербальне: погляд, жест, інтонація, пауза, поза',
  'запитання, адресоване людині (у лапках)',
  'згадка про третіх осіб, команду, спільну справу чи ситуацію навколо',
  'реакція на слова чи вчинок самої людини',
  'дрібна предметна деталь середовища: місце, річ, час, обстановка',
  'коротка сцена з двох-трьох моментів, де видно перебіг подій',
]

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
    `Зміст реакції ілюструють загальні приклади (використай лише ідею, не будову й не слова):\n${cell[r.reaction].slice(0, 5).map((t) => `- ${t}`).join('\n')}`,
    `Форми тез за номерами (кожна теза в масиві відповідає своєму номеру):\n${THESIS_FORMS.map((f, i) => `${i + 1}. ${f}`).join('\n')}`,
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
  const starts = out.map((x) => x.replace(/^[«"„\s]+/, '').split(/\s+/)[0].toLowerCase())
  if (new Set(starts).size < 8) return null
  return out
}
