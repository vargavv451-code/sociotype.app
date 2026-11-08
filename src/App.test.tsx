import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { ModelAView } from './components/ModelAView'
import { KalinauskasView } from './components/KalinauskasView'
import { K_FUNCTION_IDS, KAL_CELLS, kModel } from './data/kal'
import { ProfileView } from './components/ProfileView'
import { SOCIOTYPES, TYPE_CODES } from './data/sociotypes'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  history.replaceState(null, '', '/')
})
afterEach(cleanup)

describe('основний сценарій', () => {
  it('4 дихотомії → соціотип → профіль → модель А → 10+10 тез → аналіз', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Екстраверт' }))
    await user.click(screen.getByRole('button', { name: 'Етик' }))
    await user.click(screen.getByRole('button', { name: 'Інтуїт' }))
    expect(screen.getByText(/Оберіть ще 1 дихотомію/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Ірраціонал' }))

    expect(screen.getByText('Гекслі', { selector: 'h2' })).toBeTruthy()
    expect(screen.getAllByText('IEE').length).toBeGreaterThan(0)

    // зміна дихотомії без перезавантаження
    await user.click(screen.getByRole('button', { name: 'Раціонал' }))
    expect(screen.getByText('Гамлет', { selector: 'h2' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Ірраціонал' }))

    await user.click(screen.getByRole('button', { name: 'Відкрити повний профіль' }))
    expect(screen.getByText('Основні особливості мислення')).toBeTruthy()

    await user.click(screen.getByRole('tab', { name: 'Модель А (довідково)' }))
    expect(screen.getAllByRole('row').length).toBe(1 + 8 + 1) // шапка + 8 позицій + розгорнутий опис
    await user.click(screen.getByRole('button', { name: /Показати функцію за Калінаускасом/ }))
    // IEE: базова Ne → функція 1 за Калінаускасом
    expect(screen.getByText('Функція організації', { selector: 'div' })).toBeTruthy()

    const plus = screen.getByLabelText('Тези плюс')
    const minus = screen.getByLabelText('Тези мінус')
    expect(within(plus).getAllByRole('listitem')).toHaveLength(10)
    expect(within(minus).getAllByRole('listitem')).toHaveLength(10)
    expect(within(plus).getByText(KAL_CELLS.Ne[1].plus[0])).toBeTruthy()
    expect(within(minus).getByText(KAL_CELLS.Ne[1].minus[0])).toBeTruthy()
  })

  it('вкладки без соціотипу не порожні', async () => {
    const user = userEvent.setup()
    render(<App />)
    for (const name of ['Профіль', 'Функції й реакції', 'Модель А (довідково)']) {
      await user.click(screen.getByRole('tab', { name }))
      expect(screen.getByRole('button', { name: 'Обрати соціотип' })).toBeTruthy()
    }
    await user.click(screen.getByRole('tab', { name: 'Комунікація' }))
    expect(screen.getByText(/Оберіть соціотип, щоб побачити тези/)).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Про довідник' }))
    expect(screen.getByText('Квадра Альфа')).toBeTruthy()
  })

  it('пошук знаходить тип за псевдонімом і відкриває профіль', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Пошук за соціотипом'), 'Гекслі')
    await user.click(await screen.findByRole('button', { name: /IEE.*Гекслі/ }))
    expect(screen.getByText('Основні особливості мислення')).toBeTruthy()
  })

  it('аналіз повідомлення показує аспекти й фрази', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Пошук за соціотипом'), 'IEE')
    await user.click(await screen.findByRole('button', { name: /IEE.*Гекслі/ }))
    await user.click(screen.getByRole('tab', { name: 'Комунікація' }))
    await user.type(screen.getByPlaceholderText(/Наприклад/), 'Дякую за ідею. Ти маєш негайно дати результат.')
    await user.click(screen.getByRole('button', { name: 'Проаналізувати' }))
    expect(screen.getByText('Потенційно позитивні фрази')).toBeTruthy()
    expect(screen.getByText('Потенційно негативні фрази')).toBeTruthy()
    // перемикання плюс/мінус і контексту
    await user.click(screen.getByRole('button', { name: 'Мінус (−)' }))
    await user.click(screen.getByRole('button', { name: 'Конфлікт' }))
    expect(screen.getAllByText(/Приклад ситуації: конфлікт/).length).toBe(1)
  })
})

describe('усі 16 типів × 4 функції за Калінаускасом', () => {
  it.each(TYPE_CODES)('%s: профіль, модель А і тези рендеряться', (code) => {
    const t = SOCIOTYPES[code]
    const { unmount } = render(<ProfileView type={t} onOpenModel={() => {}} />)
    expect(screen.getByText(t.nickname, { selector: 'h2' })).toBeTruthy()
    unmount()
    const m = render(<ModelAView type={t} onOpenKal={() => {}} />)
    expect(screen.getAllByRole('row').length).toBeGreaterThanOrEqual(9)
    m.unmount()
    for (const f of K_FUNCTION_IDS) {
      const r = render(<KalinauskasView type={t} fn={f} onChange={() => {}} />)
      expect(within(screen.getByLabelText('Тези плюс')).getAllByRole('listitem')).toHaveLength(10)
      expect(within(screen.getByLabelText('Тези мінус')).getAllByRole('listitem')).toHaveLength(10)
      r.unmount()
    }
  })
})

describe('дані за Калінаускасом', () => {
  it('кожна клітина: 10 унікальних тез (+) і 10 (−), є опис', () => {
    for (const cells of Object.values(KAL_CELLS)) {
      for (const f of K_FUNCTION_IDS) {
        const c = cells[f]
        expect(c.plus).toHaveLength(10)
        expect(c.minus).toHaveLength(10)
        expect(new Set([...c.plus, ...c.minus]).size).toBe(20)
        expect(c.summary.length).toBeGreaterThan(40)
      }
    }
  })

  it('об’єктні аспекти (e) і суб’єктні (i) відповідають функціям: 4 різні аспекти на тип', () => {
    for (const code of TYPE_CODES) {
      const m = kModel(SOCIOTYPES[code])
      expect(new Set(Object.values(m)).size).toBe(4)
    }
  })

  it('зіставлення з моделлю А: функції 1,2,3,4 = позиції 1,2,6,5', () => {
    expect(kModel(SOCIOTYPES.ILE)).toEqual({ 1: 'Ne', 2: 'Ti', 3: 'Fe', 4: 'Si' })
    expect(kModel(SOCIOTYPES.IEE)).toEqual({ 1: 'Ne', 2: 'Fi', 3: 'Te', 4: 'Si' })
  })

  it('усі розділи мають позначку джерела', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Пошук за соціотипом'), 'IEE')
    await user.click(await screen.findByRole('button', { name: /IEE.*Гекслі/ }))
    for (const name of ['Профіль', 'Функції й реакції', 'Комунікація', 'Модель А (довідково)', 'Про довідник']) {
      await user.click(screen.getByRole('tab', { name }))
      const tags = document.querySelectorAll('[data-source]')
      expect(tags.length, name).toBeGreaterThan(0)
    }
  })
})
