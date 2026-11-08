import { describe, expect, it } from 'vitest'
import { SOCIOTYPES, TYPE_CODES } from '../../sociotypes'
import { K_FUNCTION_IDS, kModel } from '..'
import { K_TYPE_DESCRIPTIONS } from '.'

describe('описи типів за Калінаускасом', () => {
  it('пара вказує на тип-партнера, що також має опис і вказує назад', () => {
    for (const [code, d] of Object.entries(K_TYPE_DESCRIPTIONS)) {
      const partner = K_TYPE_DESCRIPTIONS[d!.pair]
      expect(partner, `${code}→${d!.pair}`).toBeTruthy()
      expect(partner!.pair).toBe(code)
    }
  })
  it('спільні функції пари мають однакові аспекти, окремі — різні, і тексти спільних збігаються', () => {
    for (const [code, d] of Object.entries(K_TYPE_DESCRIPTIONS)) {
      const a = kModel(SOCIOTYPES[code as keyof typeof SOCIOTYPES])
      const b = kModel(SOCIOTYPES[d!.pair])
      const p = K_TYPE_DESCRIPTIONS[d!.pair]!
      for (const f of K_FUNCTION_IDS) {
        expect(d!.fn[f].text.length, `${code}/${f}`).toBeGreaterThan(80)
        if (d!.fn[f].shared) {
          expect(a[f], `${code}/${f}`).toBe(b[f])
          expect(p.fn[f].text).toBe(d!.fn[f].text)
        } else {
          // однаковий аспект без позначки «спільне» допустимий лише за явної розбіжності джерела
          if (a[f] === b[f]) expect(Boolean(d!.fn[f].caveat || p.fn[f].caveat), `${code}/${f}`).toBe(true)
        }
      }
    }
  })
  it('описано всі 16 типів', () => {
    expect(Object.keys(K_TYPE_DESCRIPTIONS).sort()).toEqual([...TYPE_CODES].sort())
  })
  it('усі типи з описом існують', () => {
    for (const c of Object.keys(K_TYPE_DESCRIPTIONS)) expect(TYPE_CODES).toContain(c)
  })
})
