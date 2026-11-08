import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatPanel, sendChat } from './ChatPanel'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear() })

describe('чат', () => {
  it('sendChat повертає відповідь або зрозумілу помилку', async () => {
    const ok = async () => new Response(JSON.stringify({ answer: 'так' }), { status: 200 })
    expect(await sendChat([{ role: 'user', content: 'q' }], '', ok as unknown as typeof fetch)).toBe('так')
    const nf = async () => new Response('Not found', { status: 404 })
    await expect(sendChat([{ role: 'user', content: 'q' }], '', nf as unknown as typeof fetch)).rejects.toThrow(/розміщеному сайті/)
  })

  it('відкривається, надсилає питання з контекстом і показує відповідь із позначкою джерела', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ answer: 'Це відповідь.\nКалінаускас' }), { status: 200 }))
    vi.stubGlobal('fetch', f)
    const user = userEvent.setup()
    render(<ChatPanel context="Соціотип: IEE" />)
    await user.click(screen.getByRole('button', { name: 'Запитати Claude' }))
    await user.type(screen.getByLabelText('Ваше питання'), 'Що таке Ne?')
    await user.click(screen.getByRole('button', { name: 'Надіслати' }))
    expect(await screen.findByText(/Це відповідь/)).toBeTruthy()
    expect(document.querySelector('[data-source="ШІ"]')).toBeTruthy()
    const chatCall = f.mock.calls.find((c) => (c as unknown[])[0] === '/api/chat') as unknown as [string, RequestInit]
    expect(JSON.parse(chatCall[1].body as string).context).toBe('Соціотип: IEE')
  })
})
