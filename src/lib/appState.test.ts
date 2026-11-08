import { describe, expect, it } from 'vitest'
import { decodeDich, encodeDich, parseState, stateToHash } from './appState'

describe('стан у адресі', () => {
  it('кодує й розкодовує дихотомії', () => {
    const d = { ei: 'extravert', lf: 'ethic', sn: 'intuition', rp: 'irrational' } as const
    expect(encodeDich(d)).toBe('efnp')
    expect(decodeDich('efnp')).toEqual(d)
    expect(encodeDich({ ei: 'introvert' })).toBe('i___')
    expect(decodeDich('i___')).toEqual({ ei: 'introvert' })
  })
  it('хеш туди й назад', () => {
    const s = { tab: 'triggers', dich: { ei: 'introvert', lf: 'logic', sn: 'sensing', rp: 'rational' }, fn: 3 } as const
    expect(parseState(stateToHash(s as never))).toEqual(s)
  })
  it('ігнорує сміття', () => {
    expect(parseState('')).toBeNull()
    expect(parseState('#tab=hack&fn=9')).toEqual({})
  })
})
