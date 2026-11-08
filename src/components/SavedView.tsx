import { useState } from 'react'
import { SOCIOTYPES } from '../data/sociotypes'
import type { SavedItem, SyncStatus } from '../lib/saved'
import type { Account } from '../lib/account'
import type { TypeCode } from '../data/types'
import { Card, EmptyState } from './ui'

interface Props {
  items: SavedItem[]
  current: TypeCode | null
  onOpen: (c: TypeCode, tab: 'profile' | 'triggers') => void
  onNote: (c: TypeCode, note: string) => void
  onRemove: (c: TypeCode) => void
  onPick: () => void
  account: Account | null
  status: SyncStatus
  error: string
  onSignIn: (action: 'login' | 'register', login: string, password: string) => Promise<void>
  onSignOut: () => void
}

const inputCls = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base sm:text-sm dark:border-stone-600 dark:bg-stone-900/40'
const STATUS_TEXT: Record<SyncStatus, string> = {
  local: '',
  syncing: 'Синхронізація…',
  synced: 'Збережено на сервері',
  error: 'Не вдалося синхронізувати',
}

function AccountBox({ account, status, error, onSignIn, onSignOut }: Pick<Props, 'account' | 'status' | 'error' | 'onSignIn' | 'onSignOut'>) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (account) {
    return (
      <Card>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm">Ви увійшли як <strong className="break-all">{account.login}</strong></p>
          {STATUS_TEXT[status] && <span role="status" className="text-xs text-stone-500 dark:text-stone-400">{STATUS_TEXT[status]}</span>}
          <button type="button" onClick={onSignOut} className="ml-auto rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700">
            Вийти
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Список і нотатки доступні на всіх пристроях, де ви увійдете з цим логіном.</p>
      </Card>
    )
  }

  const go = async (action: 'login' | 'register') => {
    setBusy(true)
    setErr('')
    try {
      await onSignIn(action, login, password)
      setPassword('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold">Вхід, щоб список був на всіх пристроях</h2>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
        Без входу список лишається лише в цьому браузері. Для входу потрібні лише логін і пароль, пошта не збирається, тому відновити забутий пароль неможливо. На сервері зберігаються логін, хеш пароля та ваш список із нотатками.
      </p>
      <form className="mt-3 grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void go('login') }}>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Логін</span>
          <input className={inputCls} value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={32} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Пароль</span>
          <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" maxLength={128} />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" disabled={busy || !login || !password} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
            Увійти
          </button>
          <button type="button" disabled={busy || !login || !password} onClick={() => void go('register')} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 disabled:opacity-40 dark:border-stone-600 dark:hover:bg-stone-700">
            Зареєструватися
          </button>
        </div>
        <p className="text-xs text-stone-500 sm:col-span-2 dark:text-stone-400">Логін: 3–32 символи (латиниця, цифри, . _ -). Пароль: від 8 символів.</p>
        {err && <p role="alert" className="text-sm text-rose-700 sm:col-span-2 dark:text-rose-300">{err}</p>}
      </form>
    </Card>
  )
}

export function SavedView({ items, current, onOpen, onNote, onRemove, onPick, account, status, error, onSignIn, onSignOut }: Props) {
  return (
    <div className="space-y-4">
      <AccountBox account={account} status={status} error={error} onSignIn={onSignIn} onSignOut={onSignOut} />
      {items.length === 0 ? (
        <EmptyState
          message="Тут буде список збережених соціотипів. Відкрийте тип і натисніть «☆ Зберегти»."
          action="Обрати соціотип"
          onAction={onPick}
        />
      ) : (
      <>
      <p className="text-sm text-stone-600 dark:text-stone-300">Нотатки — ваші власні записи, не частина довідника.</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => {
          const t = SOCIOTYPES[it.code]
          return (
            <li key={it.code}>
              <Card className={current === it.code ? 'ring-2 ring-indigo-500' : ''}>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-lg font-bold">{it.code}</span>
                  <span className="min-w-0 break-words font-semibold">{t.nickname}</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">{t.name} · квадра {t.quadra}</p>
                <label className="mt-3 block text-sm">
                  <span className="mb-1 block font-medium">Нотатка</span>
                  <textarea
                    value={it.note}
                    onChange={(e) => onNote(it.code, e.target.value)}
                    rows={3}
                    maxLength={600}
                    placeholder="Наприклад: з ким це порівнюю, що перевірити…"
                    className="w-full resize-y rounded-lg border border-stone-300 bg-white p-2 text-base sm:text-sm dark:border-stone-600 dark:bg-stone-900/40"
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onOpen(it.code, 'profile')} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                    Профіль
                  </button>
                  <button type="button" onClick={() => onOpen(it.code, 'triggers')} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700">
                    Функції й реакції
                  </button>
                  <button type="button" onClick={() => onRemove(it.code)} className="ml-auto rounded-lg px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30">
                    Видалити
                  </button>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
      </>
      )}
    </div>
  )
}
