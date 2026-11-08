import type { AspectCode, Sociotype } from '../types'
import type { KCellTable, KFunctionId } from './cellTypes'
import { FE_K, FI_K } from './ethics'
import { NE_K, NI_K } from './intuition'
import { TE_K, TI_K } from './logic'
import { SE_K, SI_K } from './sensing'

export const KAL_CELLS: Record<AspectCode, KCellTable> = {
  Ne: NE_K, Ni: NI_K, Se: SE_K, Si: SI_K, Te: TE_K, Ti: TI_K, Fe: FE_K, Fi: FI_K,
}

export const K_FUNCTION_IDS: KFunctionId[] = [1, 2, 3, 4]

export interface KFunctionInfo {
  id: KFunctionId
  name: string
  /** Формула за Калінаускасом: що людина робить з інформацією аспекту */
  formula: string
  /** Для чого, за Калінаускасом, ця функція потрібна */
  purpose: string
  /** Позиція в класичній моделі А, якій відповідає функція (за зіставленням, перевіреним на 16 типах) */
  modelAPosition: 1 | 2 | 6 | 5
  /** Що, за Калінаускасом, відбувається при мінусовому сигналі на цю функцію */
  minusSign: string
}

export const K_FUNCTIONS: Record<KFunctionId, KFunctionInfo> = {
  1: {
    id: 1,
    name: 'Функція організації',
    formula: 'споживає ззовні для сприйняття себе',
    purpose: 'Людина прагне, щоб аспект був влаштований так, як їй потрібно.',
    modelAPosition: 1,
    minusSign: 'Агресивна реакція, спроба відновити потрібний лад.',
  },
  2: {
    id: 2,
    name: 'Функція функціонування',
    formula: 'виробляє назовні для сприйняття світу',
    purpose: 'Людина реалізується, віддаючи продукт цього аспекту іншим.',
    modelAPosition: 2,
    minusSign: 'Відчуття «я нікому не потрібен».',
  },
  3: {
    id: 3,
    name: 'Функція координації (самооцінка)',
    formula: 'виробляє назовні для сприйняття себе',
    purpose: 'Самооцінка людини залежить від того, як до неї звертаються в цьому аспекті.',
    modelAPosition: 6,
    minusSign: 'Вегетативна реакція й прагнення уникнути ситуації.',
  },
  4: {
    id: 4,
    name: 'Функція зв’язку (сугестія)',
    formula: 'споживає ззовні для сприйняття світу',
    purpose: 'Людині комфортно, коли аспект «підкладено» ззовні без зусиль.',
    modelAPosition: 5,
    minusSign: 'Неусвідомлене роздратування, бажання піти.',
  },
}

/** Чотири функції за Калінаускасом для типу: аспекти в позиціях моделі А 1, 2, 6, 5. */
export function kModel(type: Sociotype): Record<KFunctionId, AspectCode> {
  return { 1: type.model[1], 2: type.model[2], 3: type.model[6], 4: type.model[5] }
}

/** Об’єктний аспект (екстравертний) чи суб’єктний (інтровертний) за Калінаускасом. */
export function elementKind(a: AspectCode): 'об’єктний' | 'суб’єктний' {
  return a[1] === 'e' ? 'об’єктний' : 'суб’єктний'
}
