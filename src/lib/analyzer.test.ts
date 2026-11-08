import { describe, expect, it } from 'vitest'
import { SOCIOTYPES } from '../data/sociotypes'
import { analyzeMessage, detectAspects, detectTone } from './analyzer'

describe('аналізатор повідомлень', () => {
  it('розпізнає аспекти за ключовими словами', () => {
    expect(detectAspects('У мене є цікава ідея і кілька варіантів')).toContain('Ne')
    expect(detectAspects('Покажи факти й цифри, потрібен результат')).toContain('Te')
    expect(detectAspects('Тут важлива довіра і щирість')).toContain('Fi')
    expect(detectAspects('Просто привіт')).toEqual([])
  })

  it('розпізнає тон', () => {
    expect(detectTone('Дякую, чудова ідея')).toBe('affirm')
    expect(detectTone('Ти маєш зробити це негайно')).toBe('demand')
    expect(detectTone('Це все нереально')).toBe('critical')
    expect(detectTone('Я допоможу тобі з цим')).toBe('support')
    expect(detectTone('Сьогодні вівторок')).toBe('neutral')
    expect(detectTone('Це не корисно')).toBe('critical')
  })

  it('співвідносить аспект із функцією за Калінаускасом', () => {
    const r = analyzeMessage('Ця ідея нереальна.', SOCIOTYPES.IEE)
    expect(r[0].aspects[0].aspect).toBe('Ne')
    expect(r[0].aspects[0].kfunction).toBe(1)
    expect(r[0].aspects[0].verdict).toBe('minus')
  })

  it('аспект поза чотирма функціями не оцінюється', () => {
    const fi = analyzeMessage('Тут важлива довіра.', SOCIOTYPES.IEE)[0].aspects.find((x) => x.aspect === 'Fi')
    expect(fi?.kfunction).toBe(2)
    const ti = analyzeMessage('Потрібна логічна схема.', SOCIOTYPES.IEE)[0].aspects.find((x) => x.aspect === 'Ti')
    expect(ti?.kfunction).toBeUndefined()
    expect(ti?.verdict).toBe('neutral')
  })

  it('без соціотипу не вигадує позицію', () => {
    const r = analyzeMessage('Дякую за ідею.', null)
    expect(r[0].aspects[0].kfunction).toBeUndefined()
    expect(r[0].aspects[0].verdict).toBe('neutral')
  })

  it('ділить текст на фрази', () => {
    expect(analyzeMessage('Перша фраза. Друга фраза!\nТретя', null)).toHaveLength(3)
  })
})
