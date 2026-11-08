import { useEffect, useState } from 'react'

/** Стан, що переживає оновлення сторінки й повернення назад (у межах вкладки браузера). */
export function usePersistentState<T>(key: string, initial: T, valid?: (v: unknown) => boolean): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key)
      if (raw !== null) {
        const v = JSON.parse(raw)
        if (!valid || valid(v)) return v as T
      }
    } catch {
      /* сховище недоступне або дані пошкоджені */
    }
    return initial
  })
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ігноруємо */
    }
  }, [key, value])
  return [value, setValue]
}
