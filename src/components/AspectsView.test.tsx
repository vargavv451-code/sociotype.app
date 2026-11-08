import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { SOCIOTYPES, TYPE_CODES } from '../data/sociotypes'
import { POSITION_IDS } from '../data/positions'
import { ASPECTS } from '../data/aspects'
import { ELEMENTS } from '../data/kal/elements'
import type { AspectCode } from '../data/types'

describe('Аспекти', () => {
  afterEach(cleanup)
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); location.hash = '' })

  it('кожен аспект стоїть на кожній позиції рівно у двох типів', () => {
    for (const a of Object.keys(ASPECTS) as AspectCode[]) {
      for (const p of POSITION_IDS) {
        expect(TYPE_CODES.filter((c) => SOCIOTYPES[c].model[p] === a), `${a}/${p}`).toHaveLength(2)
      }
    }
  })

  it('є опис усіх чотирьох елементів із двома формами', () => {
    for (const k of ['T', 'F', 'N', 'S'] as const) {
      expect(ELEMENTS[k].nature.length).toBeGreaterThan(30)
      expect(ELEMENTS[k].object).toBeTruthy()
      expect(ELEMENTS[k].subject).toBeTruthy()
    }
  })

  it('вкладка показує всі 8 аспектів і перемикається між ними', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Аспекти' }))
    const tabs = within(screen.getByRole('tablist', { name: 'Аспекти' })).getAllByRole('tab')
    expect(tabs).toHaveLength(8)
    expect(screen.getByRole('heading', { name: /Ne · Інтуїція можливостей/ })).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Si' }))
    expect(screen.getByRole('heading', { name: /Si · Сенсорика відчуттів/ })).toBeTruthy()
    expect(screen.getAllByText(/Аналізує внутрішні відчуття/).length).toBeGreaterThan(0)
  })
})
