import type { AspectCode } from '../types'

export type KFunctionId = 1 | 2 | 3 | 4

/** Розбір одного аспекту на одній із чотирьох функцій системи Калінаускаса. */
export interface KCell {
  /** Переказ розбору Калінаускаса для цього аспекту на цій функції (джерело: Калінаускас). */
  summary: string
  /** 10 тез (+): формулювання автора сайту за мотивами цього розбору (джерело: Моє). */
  plus: string[]
  /** 10 тез (−): формулювання автора сайту за мотивами цього розбору (джерело: Моє). */
  minus: string[]
}

export type KCellTable = Record<KFunctionId, KCell>
export type KCells = Record<AspectCode, KCellTable>
