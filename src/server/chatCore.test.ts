import { describe, expect, it, vi } from 'vitest'
import { aggregate, askClaude, buildSystem, checkRate, parseChatBody, sanitizeEvent, type KV } from './chatCore'

const memKV = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return { data, get: async (k) => data.get(k) ?? null, put: async (k, v) => { data.set(k, v) } }
}

describe('parseChatBody', () => {
  it('приймає коректний запит і обрізає контекст', () => {
    const r = parseChatBody({ messages: [{ role: 'user', content: ' Привіт ' }], context: 'x'.repeat(5000) })
    expect(r.ok && r.value.messages[0].content).toBe('Привіт')
    expect(r.ok && r.value.context.length).toBe(3000)
  })
  it('відхиляє порожнє, задовге й невірний порядок', () => {
    expect(parseChatBody(null).ok).toBe(false)
    expect(parseChatBody({ messages: [] }).ok).toBe(false)
    expect(parseChatBody({ messages: [{ role: 'user', content: 'a'.repeat(1501) }] }).ok).toBe(false)
    expect(parseChatBody({ messages: [{ role: 'assistant', content: 'a' }] }).ok).toBe(false)
    expect(parseChatBody({ messages: [{ role: 'system', content: 'a' }] }).ok).toBe(false)
    expect(parseChatBody({ messages: Array.from({ length: 13 }, () => ({ role: 'user', content: 'a' })) }).ok).toBe(false)
  })
})

describe('buildSystem', () => {
  it('містить правила джерел і контекст', () => {
    const s = buildSystem('Соціотип: IEE')
    expect(s).toContain('Моє')
    expect(s).toContain('Соціотип: IEE')
    expect(buildSystem('')).toContain('ще не обрано')
  })
})

describe('askClaude', () => {
  it('надсилає ключ і повертає текст', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ content: [{ type: 'text', text: 'Відповідь' }] }), { status: 200 }))
    const t = await askClaude({ apiKey: 'k', model: 'm', system: 's', messages: [{ role: 'user', content: 'q' }], fetchFn: f as unknown as typeof fetch })
    expect(t).toBe('Відповідь')
    const init = (f.mock.calls[0] as unknown as [string, RequestInit])[1]
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('k')
  })
  it('кидає помилку при збої API', async () => {
    const f = async () => new Response('{}', { status: 500 })
    await expect(askClaude({ apiKey: 'k', model: 'm', system: 's', messages: [], fetchFn: f as unknown as typeof fetch })).rejects.toThrow()
  })
})

describe('ліміт, події, статистика', () => {
  it('ліміт спрацьовує після N запитів і не діє без KV', async () => {
    const kv = memKV()
    expect(await checkRate(kv, 'ip', 2, 0)).toBe(true)
    expect(await checkRate(kv, 'ip', 2, 0)).toBe(true)
    expect(await checkRate(kv, 'ip', 2, 0)).toBe(false)
    expect(await checkRate(undefined, 'ip', 1)).toBe(true)
  })
  it('події: дозволені назви, обмеження значень', () => {
    expect(sanitizeEvent({ name: 'hack' })).toBeNull()
    expect(sanitizeEvent({ name: 'tab', props: { tab: 'comm', long: 'x'.repeat(999) } })?.props.long.length).toBe(300)
  })
  it('агрегація рахує за типами', () => {
    const r = aggregate([
      { name: 'pick_type', props: { type: 'IEE' } },
      { name: 'pick_type', props: { type: 'IEE' } },
      { name: 'chat', props: { chars: '40' } },
    ])
    expect(r.pick_type.IEE).toBe(2)
    expect(r.chat['запитів']).toBe(1)
  })
})
