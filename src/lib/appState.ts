import type { Dichotomies } from '../data/types'

export type Tab = 'pick' | 'profile' | 'model' | 'triggers' | 'comm' | 'about'
export const TAB_IDS: Tab[] = ['pick', 'profile', 'triggers', 'comm', 'model', 'about']

export interface AppState {
  tab: Tab
  dich: Partial<Dichotomies>
  fn: 1 | 2 | 3 | 4
}

const EI = { e: 'extravert', i: 'introvert' } as const
const LF = { l: 'logic', f: 'ethic' } as const
const SN = { s: 'sensing', n: 'intuition' } as const
const RP = { r: 'rational', p: 'irrational' } as const

const rev = <T extends Record<string, string>>(m: T, v: string | undefined) => Object.keys(m).find((k) => m[k] === v) ?? '_'

/** Чотири дихотомії → рядок із чотирьох символів, наприклад «efnp»; «_» — не обрано. */
export function encodeDich(d: Partial<Dichotomies>): string {
  return rev(EI, d.ei) + rev(LF, d.lf) + rev(SN, d.sn) + rev(RP, d.rp)
}

export function decodeDich(s: string): Partial<Dichotomies> {
  const out: Partial<Dichotomies> = {}
  if (s.length !== 4) return out
  if (s[0] in EI) out.ei = EI[s[0] as keyof typeof EI]
  if (s[1] in LF) out.lf = LF[s[1] as keyof typeof LF]
  if (s[2] in SN) out.sn = SN[s[2] as keyof typeof SN]
  if (s[3] in RP) out.rp = RP[s[3] as keyof typeof RP]
  return out
}

export function stateToHash(s: AppState): string {
  return `#tab=${s.tab}&d=${encodeDich(s.dich)}&fn=${s.fn}`
}

export function parseState(hash: string): Partial<AppState> | null {
  const p = new URLSearchParams(hash.replace(/^#/, ''))
  if (!p.has('tab') && !p.has('d') && !p.has('fn')) return null
  const out: Partial<AppState> = {}
  const tab = p.get('tab')
  if (tab && (TAB_IDS as string[]).includes(tab)) out.tab = tab as Tab
  const d = p.get('d')
  if (d) out.dich = decodeDich(d)
  const fn = Number(p.get('fn'))
  if ([1, 2, 3, 4].includes(fn)) out.fn = fn as 1 | 2 | 3 | 4
  return out
}

const KEY = 'socio-state'

export function loadState(): AppState {
  let fromStore: Partial<AppState> | null = null
  try {
    fromStore = parseState(localStorage.getItem(KEY) ?? '')
  } catch {
    /* сховище недоступне */
  }
  const fromUrl = typeof location !== 'undefined' ? parseState(location.hash) : null
  const s = fromUrl ?? fromStore ?? {}
  return { tab: s.tab ?? 'pick', dich: s.dich ?? {}, fn: s.fn ?? 1 }
}

export function saveState(s: AppState) {
  try {
    localStorage.setItem(KEY, stateToHash(s))
  } catch {
    /* ігноруємо */
  }
}
