import { ASPECTS } from '../data/aspects'
import { K_FUNCTION_IDS, kModel } from '../data/kal'
import type { KFunctionId } from '../data/kal/cellTypes'
import { POSITIONS, POSITION_IDS } from '../data/positions'
import { DICHOTOMY_LABELS, SOCIOTYPES, findSociotype } from '../data/sociotypes'
import type { AspectCode, Dichotomies, PositionId, Sociotype } from '../data/types'

const OPPOSITE: { [K in keyof Dichotomies]: Record<Dichotomies[K], Dichotomies[K]> } = {
  ei: { extravert: 'introvert', introvert: 'extravert' },
  lf: { logic: 'ethic', ethic: 'logic' },
  sn: { sensing: 'intuition', intuition: 'sensing' },
  rp: { rational: 'irrational', irrational: 'rational' },
}

/** Дуал — тип, у якого протилежні три дихотомії (екстра-/інтроверсія, логіка/етика, сенсорика/інтуїція), а раціональність збігається. */
export function dualOf(t: Sociotype): Sociotype {
  const d = t.dichotomies
  const dual = findSociotype({ ei: OPPOSITE.ei[d.ei], lf: OPPOSITE.lf[d.lf], sn: OPPOSITE.sn[d.sn], rp: d.rp })
  if (!dual) throw new Error(`Не знайдено дуала для ${t.code}`)
  return dual
}

export interface DichotomyRow {
  title: string
  main: string
  other: string
  same: boolean
}

const DICH_TITLES: Record<keyof Dichotomies, string> = {
  ei: 'Екстраверсія / інтроверсія',
  lf: 'Логіка / етика',
  sn: 'Сенсорика / інтуїція',
  rp: 'Раціональність / ірраціональність',
}

export function dichotomyRows(main: Sociotype, other: Sociotype): DichotomyRow[] {
  return (Object.keys(DICH_TITLES) as (keyof Dichotomies)[]).map((k) => {
    const a = main.dichotomies[k]
    const b = other.dichotomies[k]
    const labels = DICHOTOMY_LABELS[k] as Record<string, string>
    return { title: DICH_TITLES[k], main: labels[a], other: labels[b], same: a === b }
  })
}

export interface FunctionRow {
  fn: KFunctionId
  /** Аспект основного типу на цій функції за Калінаускасом */
  mainAspect: AspectCode
  /** Аспект іншого типу на цій самій функції */
  otherAspect: AspectCode
  /** Де в моделі А іншого типу стоїть аспект основного типу */
  mainAspectInOther: { position: PositionId; name: string; strength: string }
  sameAspect: boolean
}

export function functionRows(main: Sociotype, other: Sociotype): FunctionRow[] {
  const km = kModel(main)
  const ko = kModel(other)
  return K_FUNCTION_IDS.map((fn) => {
    const aspect = km[fn]
    const position = POSITION_IDS.find((p) => other.model[p] === aspect)!
    return {
      fn,
      mainAspect: aspect,
      otherAspect: ko[fn],
      mainAspectInOther: { position, name: POSITIONS[position].name, strength: POSITIONS[position].strength },
      sameAspect: km[fn] === ko[fn],
    }
  })
}

export function sameDichotomyCount(main: Sociotype, other: Sociotype): number {
  return dichotomyRows(main, other).filter((r) => r.same).length
}

export const aspectName = (a: AspectCode) => ASPECTS[a].short

export { SOCIOTYPES }
