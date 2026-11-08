import { cleanup, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); history.replaceState(null, '', '/') })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('попередження', () => {
  it('показується при першому візиті, зникає після підтвердження й не повертається', async () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      calls.push(`${init?.method ?? 'GET'} ${url}`)
      return new Response(JSON.stringify({ acked: false }), { status: 200 })
    }))
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    expect(await screen.findByRole('dialog')).toBeTruthy()
    expect(screen.getByText(/потрапили сюди випадково/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Вийти з сайту' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Розумію, продовжити' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(calls).toContain('POST /api/ack')
    unmount()
    render(<App />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('постійний напис залишається після підтвердження', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ acked: false }), { status: 200 })))
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Розумію, продовжити' }))
    expect(screen.getByText(/Приватний любительський експеримент/)).toBeTruthy()
  })

  it('не показується, якщо сервер уже має підтвердження з цієї адреси', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ acked: true }), { status: 200 })))
    render(<App />)
    await vi.waitFor(() => expect(localStorage.getItem('socio-ack-v1')).toBe('1'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
