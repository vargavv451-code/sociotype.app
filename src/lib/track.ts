/** Анонімні події використання. Без cookies; текст повідомлень для аналізу не надсилається. */
export function track(name: 'tab' | 'pick_type' | 'function' | 'analyze' | 'chat', props: Record<string, string | number> = {}) {
  try {
    const body = JSON.stringify({ name, props })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon && typeof Blob !== 'undefined') {
      navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }))
    } else if (typeof fetch !== 'undefined') {
      void fetch('/api/event', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {})
    }
  } catch {
    /* ігноруємо */
  }
}
