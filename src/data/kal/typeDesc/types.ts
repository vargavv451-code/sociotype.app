import type { TypeCode } from '../../types'
import type { KFunctionId } from '../cellTypes'

export interface KTypeFn {
  text: string
  /** Опис цієї функції в книзі спільний для обох типів пари */
  shared?: boolean
  /** Розбіжність у самому джерелі, яку не усунено */
  caveat?: string
}

export interface KTypeDescription {
  /** Пара, у якій книга описує тип (тип-партнер за описом) */
  pair: TypeCode
  /** Вступ автора до пари (за потреби) */
  intro?: string
  fn: Record<KFunctionId, KTypeFn>
  /** Загальні зауваження автора про тип */
  note?: string
}
