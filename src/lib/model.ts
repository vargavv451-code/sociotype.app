import { ASPECTS } from '../data/aspects'
import { POSITIONS, POSITION_IDS } from '../data/positions'
import { getTheses } from '../data/theses'
import type { Aspect, Position, PositionId, Sociotype, ThesisSet } from '../data/types'

export interface FunctionEntry {
  aspect: Aspect
  position: Position
  theses: ThesisSet
}

export function getEntry(type: Sociotype, position: PositionId): FunctionEntry {
  const code = type.model[position]
  return { aspect: ASPECTS[code], position: POSITIONS[position], theses: getTheses(code, position) }
}

export function allEntries(type: Sociotype): FunctionEntry[] {
  return POSITION_IDS.map((p) => getEntry(type, p))
}
