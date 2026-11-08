import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const ten = (tag: string) => Array.from({ length: 10 }, (_, i) => `${tag}: теза ${i + 1}`)

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  history.replaceState(null, '', '/')
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('збереження стану', () => {
  it('кнопка «Назад» повертає попередній розділ і соціотип', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Пошук за соціотипом'), 'IEE')
    await user.click(await screen.findByRole('button', { name: /IEE.*Гекслі/ }))
    expect(screen.getByText('Основні особливості мислення')).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Модель А (довідково)' }))
    expect(location.hash).toContain('tab=model')
    history.back()
    await waitFor(() => expect(screen.getByText('Основні особливості мислення')).toBeTruthy())
    expect(screen.getAllByText('IEE').length).toBeGreaterThan(0)
  })

  it('після «оновлення сторінки» відновлює тип і розділ з адреси', () => {
    history.replaceState(null, '', '/#tab=triggers&d=efnp&fn=2')
    render(<App />)
    expect(screen.getByText(/Чотири функції за Калінаускасом · IEE/)).toBeTruthy()
    expect(screen.getByRole('tab', { name: /2 · Fi/, selected: true })).toBeTruthy()
  })

  it('відновлює вибір із localStorage, якщо адреса порожня', () => {
    localStorage.setItem('socio-state', '#tab=profile&d=efnp&fn=1')
    render(<App />)
    expect(screen.getByText('Основні особливості мислення')).toBeTruthy()
  })
})

describe('тези під контекст', () => {
  it('для різних контекстів показуються різні тези, а при помилці — загальні з поясненням', async () => {
    history.replaceState(null, '', '/#tab=comm&d=efnp&fn=1')
    const f = vi.fn(async (_url: string, init?: RequestInit) => {
      const b = JSON.parse(String(init?.body))
      if (b.context === 'dating') return new Response(JSON.stringify({ error: 'збій' }), { status: 502 })
      return new Response(JSON.stringify({ theses: ten(b.context) }), { status: 200 })
    })
    vi.stubGlobal('fetch', f)
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText('acquaintance: теза 1')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Робота' }))
    expect(await screen.findByText('work: теза 1')).toBeTruthy()
    expect(screen.queryByText('acquaintance: теза 1')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Побачення' }))
    expect(await screen.findByText(/Показано загальні тези/)).toBeTruthy()
    expect(document.querySelectorAll('ol li').length).toBe(10)
  })
})
