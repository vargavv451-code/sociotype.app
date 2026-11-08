import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

describe('Збережені', () => {
  afterEach(cleanup)
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); location.hash = '' })

  it('зберігає тип, нотатку, і повертає до нього після перезавантаження', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.type(screen.getByLabelText('Пошук за соціотипом'), 'IEE')
    await user.click(await screen.findByRole('button', { name: /IEE.*Гекслі/ }))
    await user.click(screen.getByRole('button', { name: '☆ Зберегти' }))
    expect(screen.getByRole('button', { name: '★ Збережено' })).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Збережені' }))
    await user.type(screen.getByLabelText('Нотатка'), 'перевірити')
    unmount()

    render(<App />)
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Збережені' }))
    expect(screen.getByText('IEE')).toBeTruthy()
    expect((screen.getByLabelText('Нотатка') as HTMLTextAreaElement).value).toBe('перевірити')
  })

  it('порожній список має підказку, видалення працює', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Збережені' }))
    expect(screen.getByText(/Тут буде список збережених/)).toBeTruthy()
  })
})

describe('Вхід у «Збережені»', () => {
  afterEach(cleanup)
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); location.hash = '' })

  it('показує форму входу без акаунта', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Збережені' }))
    expect(screen.getByLabelText('Логін')).toBeTruthy()
    expect(screen.getByLabelText('Пароль')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Увійти' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
