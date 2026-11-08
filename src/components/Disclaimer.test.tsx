import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); history.replaceState(null, '', '/') })
afterEach(cleanup)

describe('попередження', () => {
  it('показується при першому візиті, зникає після підтвердження й не повертається', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText(/потрапили сюди випадково/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Вийти з сайту' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Розумію, продовжити' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    unmount()
    render(<App />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('постійний напис залишається після підтвердження', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Розумію, продовжити' }))
    expect(screen.getByText(/Приватний любительський експеримент/)).toBeTruthy()
  })
})
