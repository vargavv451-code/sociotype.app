import { PROFILES } from '../data/profiles'
import { K_FUNCTIONS, K_FUNCTION_IDS, kModel } from '../data/kal'
import { K_TYPE_DESCRIPTIONS } from '../data/kal/typeDesc'
import { SOCIOTYPES } from '../data/sociotypes'
import { DICHOTOMY_LABELS, QUADRAS } from '../data/sociotypes'
import type { Sociotype } from '../data/types'
import { Card, Chip, SourceTag } from './ui'

export function ProfileView({ type, onOpenModel }: { type: Sociotype; onOpenModel: () => void }) {
  const p = PROFILES[type.code]
  const d = type.dichotomies
  const kDesc = K_TYPE_DESCRIPTIONS[type.code]

  const rows: [string, string][] = [
    ['Основні особливості мислення', p.thinking],
    ['Сприйняття світу', p.perception],
    ['Поведінка у спілкуванні', p.communication],
    ['Поведінка в конфліктах', p.conflict],
    ['Романтичні стосунки', p.romance],
    ['Професійна діяльність', p.career],
    ['Мотивація', p.motivation],
    ['Страхи та джерела дискомфорту', p.fears],
    ['Особливості прийняття рішень', p.decisions],
    ['Способи особистого розвитку', p.growth],
  ]

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-sm font-bold tracking-wider text-white">{type.code}</span>
          <Chip tone="accent">Квадра {QUADRAS[type.quadra].name}</Chip>
          {(['ei', 'lf', 'sn', 'rp'] as const).map((k) => (
            <Chip key={k}>{(DICHOTOMY_LABELS[k] as Record<string, string>)[d[k]]}</Chip>
          ))}
        </div>
        <h2 className="mt-3 text-2xl font-semibold">{type.nickname}</h2>
        <p className="text-stone-600 dark:text-stone-300">{type.name}</p>
        <p className="mt-3 text-sm leading-relaxed">{type.summary}</p>
        <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          Квадра {QUADRAS[type.quadra].name}: {QUADRAS[type.quadra].types.join(', ')}.
        </p>
        <SourceTag s="Аугустінавічюте" />
      </Card>

      {kDesc && (
        <Card>
          <h3 className="font-semibold">Опис типу за Калінаускасом</h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            Переказ опису типу з книги по чотирьох функціях. Книга описує тип разом із типом-партнером ({SOCIOTYPES[kDesc.pair].nickname}): коли опис функції в ній спільний для обох, це позначено.
          </p>
          {kDesc.intro && <p className="mt-2 text-sm">{kDesc.intro}</p>}
          <ol className="mt-3 space-y-3">
            {K_FUNCTION_IDS.map((f) => (
              <li key={f} className="rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span>{f}-а функція · {K_FUNCTIONS[f].name}</span>
                  <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 font-mono text-xs font-bold text-white">{kModel(type)[f]}</span>
                  {kDesc.fn[f].shared && <Chip>спільне з типом {SOCIOTYPES[kDesc.pair].nickname}</Chip>}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{kDesc.fn[f].text}</p>
                {kDesc.fn[f].caveat && (
                  <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    Розбіжність у джерелі: {kDesc.fn[f].caveat}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {kDesc.note && <p className="mt-3 text-sm">{kDesc.note}</p>}
          <SourceTag s="Калінаускас" />
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold text-emerald-700 dark:text-emerald-300">Сильні сторони</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            {p.strengths.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <SourceTag s="Моє" />
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold text-rose-700 dark:text-rose-300">Слабкі сторони</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            {p.weaknesses.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <SourceTag s="Моє" />
        </Card>
      </div>

      <Card className="overflow-hidden p-0 sm:p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm sm:table-auto">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/40 dark:text-stone-400">
              <tr>
                <th className="w-2/5 px-3 py-2.5 sm:w-1/3 sm:px-4">Розділ</th>
                <th className="px-3 py-2.5 sm:px-4">Опис</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {rows.map(([k, v]) => (
                <tr key={k} className="align-top">
                  <th scope="row" className="break-words px-3 py-3 font-medium sm:px-4">{k}</th>
                  <td className="break-words px-3 py-3 leading-relaxed sm:px-4 text-stone-700 dark:text-stone-200">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-3"><SourceTag s="Моє" /></div>
      </Card>

      <Card>
        <h3 className="mb-1 font-semibold">Приклад із повсякдення</h3>
        <p className="text-sm leading-relaxed">{p.example}</p>
        <SourceTag s="Моє" />
      </Card>

      <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
        Профіль — це інтерпретація поведінки за описами соціоніки, а не підтверджене дослідженнями твердження про конкретну людину.
        Опис чотирьох функцій за Калінаускасом — у розділі «Функції й реакції».
      </p>

      <button type="button" onClick={onOpenModel} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Перейти до моделі А
      </button>
    </div>
  )
}
