import { describe, expect, it } from 'vitest'
import { SOCIOTYPES, TYPE_CODES, findSociotype } from './sociotypes'
import { THESES } from './theses'
import { ASPECT_CODES } from './aspects'
import { POSITION_IDS } from './positions'
import type { AspectCode, TypeCode } from './types'

// Еталонні таблиці моделі А (позиції 1..8), введені окремо від алгоритму виведення.
// Порядок 5–8 звірено з таблицями англомовної Вікіпедії та з розбором функцій у Калінаускаса.
const REFERENCE: Record<TypeCode, string> = {
  ILE: 'Ne Ti Se Fi Si Fe Ni Te',
  SEI: 'Si Fe Ni Te Ne Ti Se Fi',
  ESE: 'Fe Si Te Ni Ti Ne Fi Se',
  LII: 'Ti Ne Fi Se Fe Si Te Ni',
  EIE: 'Fe Ni Te Si Ti Se Fi Ne',
  LSI: 'Ti Se Fi Ne Fe Ni Te Si',
  SLE: 'Se Ti Ne Fi Ni Fe Si Te',
  IEI: 'Ni Fe Si Te Se Ti Ne Fi',
  SEE: 'Se Fi Ne Ti Ni Te Si Fe',
  ILI: 'Ni Te Si Fe Se Fi Ne Ti',
  LIE: 'Te Ni Fe Si Fi Se Ti Ne',
  ESI: 'Fi Se Ti Ne Te Ni Fe Si',
  LSE: 'Te Si Fe Ni Fi Ne Ti Se',
  EII: 'Fi Ne Ti Se Te Si Fe Ni',
  IEE: 'Ne Fi Se Ti Si Te Ni Fe',
  SLI: 'Si Te Ni Fe Ne Fi Se Ti',
}

describe('Модель А', () => {
  it('має 16 типів', () => expect(TYPE_CODES).toHaveLength(16))

  it.each(TYPE_CODES)('%s: функції збігаються з еталоном', (code) => {
    const got = POSITION_IDS.map((p) => SOCIOTYPES[code].model[p]).join(' ')
    expect(got).toBe(REFERENCE[code])
  })

  it.each(TYPE_CODES)('%s: усі 8 аспектів зустрічаються рівно один раз', (code) => {
    const set = new Set<AspectCode>(POSITION_IDS.map((p) => SOCIOTYPES[code].model[p]))
    expect(set.size).toBe(8)
  })

  it('базова функція дуала є сугестивною (позиція 5) цього типу', () => {
    const DUALS: [TypeCode, TypeCode][] = [
      ['ILE', 'SEI'], ['ESE', 'LII'], ['EIE', 'LSI'], ['SLE', 'IEI'],
      ['SEE', 'ILI'], ['LIE', 'ESI'], ['LSE', 'EII'], ['IEE', 'SLI'],
    ]
    for (const [a, b] of DUALS) {
      expect(SOCIOTYPES[a].model[5]).toBe(SOCIOTYPES[b].model[1])
      expect(SOCIOTYPES[b].model[5]).toBe(SOCIOTYPES[a].model[1])
    }
  })

  it('кожна комбінація 4 дихотомій дає окремий соціотип', () => {
    const seen = new Set<string>()
    for (const ei of ['extravert', 'introvert'] as const)
      for (const lf of ['logic', 'ethic'] as const)
        for (const sn of ['sensing', 'intuition'] as const)
          for (const rp of ['rational', 'irrational'] as const) {
            const t = findSociotype({ ei, lf, sn, rp })
            expect(t).not.toBeNull()
            seen.add(t!.code)
          }
    expect(seen.size).toBe(16)
  })

  it('код типу збігається з дихотоміями (приклад: IEE)', () => {
    expect(SOCIOTYPES.IEE.dichotomies).toEqual({
      ei: 'extravert', lf: 'ethic', sn: 'intuition', rp: 'irrational',
    })
  })
})

describe('Тези', () => {
  const all: string[] = []
  for (const a of ASPECT_CODES)
    for (const p of POSITION_IDS) {
      const set = THESES[a][p]
      it(`${a}/${p}: рівно 10 плюсів і 10 мінусів`, () => {
        expect(set.plus).toHaveLength(10)
        expect(set.minus).toHaveLength(10)
      })
      all.push(...set.plus, ...set.minus)
    }

  it('1280 унікальних формулювань без дублів', () => {
    expect(all).toHaveLength(1280)
    const dupes = all.filter((t, i) => all.indexOf(t) !== i)
    expect(dupes).toEqual([])
  })

  it('2 560 слотів для 16 типів', () => {
    let n = 0
    for (const c of TYPE_CODES)
      for (const p of POSITION_IDS) {
        const s = THESES[SOCIOTYPES[c].model[p]][p]
        n += s.plus.length + s.minus.length
      }
    expect(n).toBe(2560)
  })
})
