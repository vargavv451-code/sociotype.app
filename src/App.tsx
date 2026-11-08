import { useEffect, useRef, useState } from 'react'
import { ChatPanel } from './components/ChatPanel'
import { DISCLAIMER_TEXT, DisclaimerBar, DisclaimerGate } from './components/Disclaimer'
import { AboutView } from './components/AboutView'
import { CommunicationView } from './components/CommunicationView'
import { DichotomyPicker } from './components/DichotomyPicker'
import { Header } from './components/Header'
import { ModelAView } from './components/ModelAView'
import { ProfileView } from './components/ProfileView'
import { SavedView } from './components/SavedView'
import { useSaved } from './lib/saved'
import { KalinauskasView } from './components/KalinauskasView'
import { EmptyState, SourceLegend } from './components/ui'
import { K_FUNCTIONS, KAL_CELLS, kModel } from './data/kal'
import { SOCIOTYPES, findSociotype } from './data/sociotypes'
import { loadState, parseState, saveState, stateToHash, type AppState, type Tab } from './lib/appState'
import { track } from './lib/track'
import type { KFunctionId } from './data/kal/cellTypes'
import type { Dichotomies, TypeCode } from './data/types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'pick', label: 'Соціотип' },
  { id: 'profile', label: 'Профіль' },
  { id: 'triggers', label: 'Функції й реакції' },
  { id: 'comm', label: 'Комунікація' },
  { id: 'saved', label: 'Збережені' },
  { id: 'model', label: 'Модель А (довідково)' },
  { id: 'about', label: 'Про довідник' },
]

/** Глибина внутрішньої історії (скільки кроків можна повернутися назад). */
function depthOf(): number {
  const i = (history.state as { i?: number } | null)?.i
  return typeof i === 'number' && i > 0 ? i : 0
}

function readTheme(): boolean {
  try {
    return localStorage.getItem('socio-theme') === 'dark'
  } catch {
    return false
  }
}

export default function App() {
  const [init] = useState<AppState>(loadState)
  const [tab, setTab] = useState<Tab>(init.tab)
  const [dich, setDich] = useState<Partial<Dichotomies>>(init.dich)
  const [fn, setFn] = useState<KFunctionId>(init.fn)
  const [dark, setDark] = useState<boolean>(readTheme)

  const type = findSociotype(dich)
  const saved = useSaved()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('socio-theme', dark ? 'dark' : 'light')
    } catch {
      /* сховище недоступне — тема діє лише в межах сесії */
    }
  }, [dark])

  // Стан живе в адресі (#tab=…&d=…&fn=…) і в localStorage: кнопка «Назад», оновлення сторінки й повторний візит нічого не скидають.
  const hash = stateToHash({ tab, dich, fn })
  const first = useRef(true)
  const [depth, setDepth] = useState<number>(depthOf)
  useEffect(() => {
    saveState({ tab, dich, fn })
    const isFirst = first.current
    first.current = false
    if (location.hash !== hash) {
      // перехід між розділами додає запис в історію, дрібні зміни й перше завантаження — ні
      const sameTab = parseState(location.hash)?.tab === tab
      if (isFirst || sameTab) history.replaceState({ i: depthOf() }, '', hash)
      else {
        const i = depthOf() + 1
        history.pushState({ i }, '', hash)
        setDepth(i)
      }
    }
  }, [hash, tab, dich, fn])

  useEffect(() => {
    const onPop = () => {
      setDepth(depthOf())
      const s = parseState(location.hash)
      if (!s) return
      if (s.tab) setTab(s.tab)
      setDich(s.dich ?? {})
      if (s.fn) setFn(s.fn)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const typeCode = type?.code
  useEffect(() => {
    if (typeCode) track('pick_type', { type: typeCode })
  }, [typeCode])

  const chatContext = (() => {
    const lines = [`Відкритий розділ: ${TABS.find((t) => t.id === tab)?.label ?? tab}`]
    if (type) {
      lines.push(`Соціотип: ${type.code} · ${type.nickname} (квадра ${type.quadra})`)
      const m = kModel(type)
      lines.push(`Функції за Калінаускасом: ${([1, 2, 3, 4] as const).map((f) => `${f}-а ${K_FUNCTIONS[f].name} = ${m[f]}`).join('; ')}`)
      if (tab === 'triggers') lines.push(`Переглядається функція ${fn} (${m[fn]}): ${KAL_CELLS[m[fn]][fn].summary}`)
    }
    return lines.join('\n')
  })()

  const changeTab = (t: Tab) => { setTab(t); track('tab', { tab: t }) }
  const changeFn = (f: KFunctionId) => { setFn(f); track('function', { fn: f }) }

  const pickType = (c: TypeCode, goTo: Tab = 'profile') => {
    setDich({ ...SOCIOTYPES[c].dichotomies })
    setTab(goTo)
  }

  const needType = (msg: string, content: () => React.ReactNode) =>
    type ? content() : <EmptyState message={msg} action="Обрати соціотип" onAction={() => setTab('pick')} />

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <DisclaimerGate />
      <DisclaimerBar />
      <header className="z-30 sm:sticky sm:top-0 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-700 dark:bg-stone-900/90">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-3">
          <Header dark={dark} onToggleTheme={() => setDark((d) => !d)} onPick={(c) => pickType(c)} />
          <nav aria-label="Розділи">
            <div className="flex flex-wrap gap-1" role="tablist">
              {(tab !== 'pick' || depth > 0) && (
                <button
                  type="button"
                  onClick={() => (depth > 0 ? history.back() : changeTab('pick'))}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  ← Назад
                </button>
              )}
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => changeTab(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    tab === t.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              {type && (
                <span className="ml-2 flex items-center gap-1 self-center">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                    {type.code} · {type.nickname}
                  </span>
                  <button
                    type="button"
                    aria-pressed={saved.isSaved(type.code)}
                    onClick={() => saved.toggle(type.code)}
                    className="rounded-full border border-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-950/30"
                  >
                    {saved.isSaved(type.code) ? '★ Збережено' : '☆ Зберегти'}
                  </button>
                </span>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'pick' && <DichotomyPicker value={dich} onChange={setDich} onOpenProfile={() => setTab('profile')} />}
        {tab === 'profile' && needType('Спершу оберіть чотири дихотомії або знайдіть тип за пошуком.', () => (
          <ProfileView type={type!} onOpenModel={() => setTab('model')} />
        ))}
        {tab === 'model' && needType('Модель А показується для обраного соціотипу.', () => (
          <ModelAView type={type!} onOpenKal={(f) => { setFn(f); setTab('triggers') }} />
        ))}
        {tab === 'triggers' && needType('Функції за Калінаускасом і тези (+) / (−) показуються для обраного соціотипу.', () => (
          <KalinauskasView type={type!} fn={fn} onChange={changeFn} />
        ))}
        {tab === 'comm' && (
          <CommunicationView
            typeCode={type?.code ?? null}
            onTypeChange={(c) => setDich({ ...SOCIOTYPES[c].dichotomies })}
            fn={fn}
            onFnChange={setFn}
          />
        )}
        {tab === 'saved' && (
          <SavedView
            items={saved.items}
            current={type?.code ?? null}
            onOpen={(c, t) => pickType(c, t)}
            onNote={saved.setNote}
            onRemove={saved.remove}
            onPick={() => setTab('pick')}
          />
        )}
        {tab === 'about' && <AboutView onPick={(c) => pickType(c)} />}
      </main>

      <footer className="mx-auto max-w-6xl space-y-3 px-4 pb-8 text-xs text-stone-500 dark:text-stone-400">
        <details>
          <summary className="cursor-pointer font-medium">Що означають позначки «Джерело»</summary>
          <div className="mt-2"><SourceLegend /></div>
        </details>
        <p>{DISCLAIMER_TEXT} Довідник працює за логікою Калінаускаса й описує соціоніку як модель інтерпретації. Він не є психологічною діагностикою й не передбачає реакцію конкретної людини.</p>
      </footer>
      <ChatPanel context={chatContext} />
    </div>
  )
}
