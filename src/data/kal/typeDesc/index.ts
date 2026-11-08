import type { TypeCode } from '../../types'
import { BALZAC, ESENIN } from './esenin-balzac'
import { DOSTOEVSKY, HAMLET } from './hamlet-dostoevsky'
import { DREISER, HUGO } from './hugo-dreiser'
import { JACK, ROBESPIERRE } from './jack-robespierre'
import { GORKY, STIRLITZ } from './stirlitz-gorky'
import { NAPOLEON, ZHUKOV } from './zhukov-napoleon'
import { DUMAS, GABIN } from './gabin-dumas'
import { DONQUIXOTE, HUXLEY } from './donquixote-huxley'
import type { KTypeDescription } from './types'

export type { KTypeDescription } from './types'

/** Описи типів за Калінаускасом (розділи 14–17), переказ: усі 16 типів, вісім пар. */
export const K_TYPE_DESCRIPTIONS: Partial<Record<TypeCode, KTypeDescription>> = {
  ILI: BALZAC,
  IEI: ESENIN,
  EIE: HAMLET,
  EII: DOSTOEVSKY,
  ESE: HUGO,
  ESI: DREISER,
  LIE: JACK,
  LII: ROBESPIERRE,
  LSE: STIRLITZ,
  LSI: GORKY,
  SLE: ZHUKOV,
  SEE: NAPOLEON,
  SLI: GABIN,
  SEI: DUMAS,
  ILE: DONQUIXOTE,
  IEE: HUXLEY,
}
