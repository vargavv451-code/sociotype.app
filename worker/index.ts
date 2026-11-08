import { onRequestPost as chat } from '../functions/api/chat'
import { onRequestGet as ackGet, onRequestPost as ackPost } from '../functions/api/ack'
import { onRequestPost as theses } from '../functions/api/theses'
import { onRequestPost as event } from '../functions/api/event'
import { onRequestPost as auth } from '../functions/api/auth'
import { onRequestGet as savedGet, onRequestPut as savedPut } from '../functions/api/saved'
import { onRequestGet as stats } from '../functions/api/stats'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any
}

/** Маршрутизація серверних функцій; усе інше віддають статичні файли з dist/. */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)
    const ctx = { request, env: env as never }
    if (pathname === '/api/chat' && request.method === 'POST') return chat(ctx)
    if (pathname === '/api/ack' && request.method === 'GET') return ackGet(ctx)
    if (pathname === '/api/ack' && request.method === 'POST') return ackPost(ctx)
    if (pathname === '/api/theses' && request.method === 'POST') return theses(ctx)
    if (pathname === '/api/event' && request.method === 'POST') return event(ctx)
    if (pathname === '/api/stats' && request.method === 'GET') return stats(ctx)
    if (pathname === '/api/auth' && request.method === 'POST') return auth(ctx)
    if (pathname === '/api/saved' && request.method === 'GET') return savedGet(ctx)
    if (pathname === '/api/saved' && request.method === 'PUT') return savedPut(ctx)
    if (pathname.startsWith('/api/')) return new Response('Not found', { status: 404 })
    return env.ASSETS.fetch(request)
  },
}
