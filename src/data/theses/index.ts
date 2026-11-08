import type { AspectCode, PositionId, ThesisSet, ThesisTable } from '../types'
import { NE } from './Ne'
import { NI } from './Ni'
import { SE } from './Se'
import { SI } from './Si'
import { TE } from './Te'
import { TI } from './Ti'
import { FE } from './Fe'
import { FI } from './Fi'

/**
 * Тези залежать від пари «аспект × позиція в моделі А» (8 × 8 = 64 пари, у кожній 10 + і 10 −).
 * Кожен соціотип у своїй моделі А має 8 таких пар, тому для 16 типів сайт показує 2 560 слотів тез,
 * які спираються на 1 280 унікальних формулювань.
 */
export const THESES: Record<AspectCode, ThesisTable> = {
  Ne: NE, Ni: NI, Se: SE, Si: SI, Te: TE, Ti: TI, Fe: FE, Fi: FI,
}

export function getTheses(aspect: AspectCode, position: PositionId): ThesisSet {
  return THESES[aspect][position]
}
