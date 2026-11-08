import { describe, expect, it } from 'vitest'
import { SOCIOTYPES, TYPE_CODES } from '../data/sociotypes'
import { dichotomyRows, dualOf, functionRows, sameDichotomyCount } from './compare'

describe('дуальність', () => {
  it('дуал дуала — це сам тип, дуал має ту саму квадру, збігається лише раціональність', () => {
    for (const c of TYPE_CODES) {
      const t = SOCIOTYPES[c]
      const d = dualOf(t)
      expect(dualOf(d).code).toBe(c)
      expect(d.quadra).toBe(t.quadra)
      expect(sameDichotomyCount(t, d)).toBe(1)
      expect(d.dichotomies.rp).toBe(t.dichotomies.rp)
    }
  })
  it('базова функція дуала стоїть на 5-й позиції типу (правило моделі А)', () => {
    for (const c of TYPE_CODES) {
      const t = SOCIOTYPES[c]
      expect(dualOf(t).model[1]).toBe(t.model[5])
      expect(dualOf(t).model[2]).toBe(t.model[6])
    }
  })
  it('приклад: дуали ILE–SEI, IEE–SLI', () => {
    expect(dualOf(SOCIOTYPES.IEE).code).toBe('SLI')
    expect(dualOf(SOCIOTYPES.ILE).code).toBe('SEI')
  })
})

describe('порівняння', () => {
  it('тип із самим собою: всі дихотомії й функції збігаються', () => {
    const t = SOCIOTYPES.IEE
    expect(sameDichotomyCount(t, t)).toBe(4)
    expect(functionRows(t, t).every((r) => r.sameAspect && r.mainAspectInOther.position === (r.fn === 3 ? 6 : r.fn === 4 ? 5 : r.fn))).toBe(true)
    expect(dichotomyRows(t, t).every((r) => r.same)).toBe(true)
  })
  it('кожен аспект основного типу знаходить місце в моделі іншого', () => {
    for (const a of TYPE_CODES) for (const b of TYPE_CODES) {
      for (const r of functionRows(SOCIOTYPES[a], SOCIOTYPES[b])) {
        expect(SOCIOTYPES[b].model[r.mainAspectInOther.position]).toBe(r.mainAspect)
      }
    }
  })
})
