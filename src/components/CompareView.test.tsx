import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

describe('Порівняння', () => {
  afterEach(cleanup)
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); location.hash = '' })

  it('основний тип — лише один, зберігається, порівняння з дуалом', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Порівняння' }))
    expect(screen.getByText(/Оберіть основний соціотип угорі/)).toBeTruthy()
    await user.selectOptions(screen.getByLabelText('Основний соціотип (лише один)'), 'IEE')
    expect(localStorage.getItem('socio-main')).toBe('IEE')
    expect(screen.getByText(/Дуал типу/).textContent).toContain('SLI')
    await user.click(screen.getByRole('button', { name: 'Порівняти з дуалом' }))
    expect(screen.getByText('Дуал основного типу')).toBeTruthy()
    expect(screen.getByText(/Збігаються 1 із 4 дихотомій/)).toBeTruthy()
    // зміна основного типу замінює попередній, а не додає
    await user.selectOptions(screen.getByLabelText('Основний соціотип (лише один)'), 'ILE')
    expect(localStorage.getItem('socio-main')).toBe('ILE')
  })

  it('основний тип не впливає на опис інших розділів', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.type(screen.getByLabelText('Пошук за соціотипом'), 'IEE')
    await user.click(await screen.findByRole('button', { name: /IEE.*Гекслі/ }))
    const before = document.querySelector('main')!.textContent
    await user.click(screen.getByRole('tab', { name: 'Порівняння' }))
    await user.selectOptions(screen.getByLabelText('Основний соціотип (лише один)'), 'LII')
    await user.click(screen.getByRole('tab', { name: 'Профіль' }))
    expect(document.querySelector('main')!.textContent).toBe(before)
    unmount()
  })

  it('тип із самим собою', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Порівняння' }))
    await user.selectOptions(screen.getByLabelText('Основний соціотип (лише один)'), 'IEE')
    await user.selectOptions(screen.getByLabelText('Порівняти з'), 'IEE')
    expect(screen.getByText('Той самий тип')).toBeTruthy()
    expect(within(document.querySelector('main')!).getByText(/Збігаються 4 із 4/)).toBeTruthy()
  })
})
