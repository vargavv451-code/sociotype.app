import { describe, expect, it } from 'vitest'
import { parseSaved } from './saved'

describe('parseSaved', () => {
  it('відкидає сміття, дублі й невідомі коди', () => {
    const out = parseSaved([
      { code: 'IEE', note: 'a', at: 1 },
      { code: 'IEE', note: 'b', at: 2 },
      { code: 'XXX', note: '', at: 3 },
      null,
      { code: 'LII' },
    ])
    expect(out.map((i) => i.code)).toEqual(['IEE', 'LII'])
    expect(out[0].note).toBe('a')
  })
  it('не-масив → порожньо', () => {
    expect(parseSaved('x')).toEqual([])
  })
})
