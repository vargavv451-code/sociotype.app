export type AspectCode = 'Ne' | 'Ni' | 'Se' | 'Si' | 'Te' | 'Ti' | 'Fe' | 'Fi'
export type PositionId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type TypeCode =
  | 'ILE' | 'SEI' | 'ESE' | 'LII'
  | 'EIE' | 'LSI' | 'SLE' | 'IEI'
  | 'SEE' | 'ILI' | 'LIE' | 'ESI'
  | 'LSE' | 'EII' | 'IEE' | 'SLI'
export type QuadraId = 'alpha' | 'beta' | 'gamma' | 'delta'
export type Reaction = 'plus' | 'minus'
export type ContextId = 'acquaintance' | 'dating' | 'friendship' | 'work' | 'conflict'

export type EI = 'extravert' | 'introvert'
export type LF = 'logic' | 'ethic'
export type SN = 'sensing' | 'intuition'
export type RP = 'rational' | 'irrational'

export interface Dichotomies {
  ei: EI
  lf: LF
  sn: SN
  rp: RP
}

export interface Aspect {
  code: AspectCode
  name: string
  short: string
  description: string
  keywords: string[]
}

export interface Position {
  id: PositionId
  name: string
  /** Короткий ключ позиції (кілька слів) */
  key: string
  /** Пояснення простими словами (1–2 речення) */
  simple: string
  block: string
  strength: 'Сильна' | 'Слабка'
  conscious: boolean
  summary: string
  detail: string
  /** Як позиція впливає на емоційну реакцію (інтерпретація, а не формальне положення) */
  reactionNote: string
}

export interface ThesisSet {
  plus: string[]
  minus: string[]
}

export type ThesisTable = Record<PositionId, ThesisSet>

export interface Profile {
  thinking: string
  perception: string
  strengths: string[]
  weaknesses: string[]
  communication: string
  conflict: string
  romance: string
  career: string
  motivation: string
  fears: string
  decisions: string
  growth: string
  example: string
}

export interface Sociotype {
  code: TypeCode
  name: string
  nickname: string
  quadra: QuadraId
  dichotomies: Dichotomies
  summary: string
  /** 8 аспектів у позиціях 1..8 */
  model: Record<PositionId, AspectCode>
}

export interface Context {
  id: ContextId
  name: string
  description: string
  plusLens: string
  minusLens: string
}
