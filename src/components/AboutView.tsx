import { Card, SourceLegend, SourceTag } from './ui'
import { QUADRAS, SOCIOTYPES } from '../data/sociotypes'
import type { TypeCode } from '../data/types'

export function AboutView({ onPick }: { onPick: (c: TypeCode) => void }) {
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Про довідник</h2>
        <p className="text-sm leading-relaxed">
          Довідник працює за логікою Ігоря Калінаускаса: у людини чотири функції (організації, функціонування, координації та зв’язку), а плюсовий чи
          мінусовий сигнал на кожну з них викликає описану емоційну реакцію. Класична модель А з вісьмома позиціями залишена як довідковий розділ;
          кожну з чотирьох функцій Калінаускаса показано разом із позицією моделі А, якій вона відповідає.
        </p>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="font-medium">Що взято з Калінаускаса</dt>
            <dd className="text-stone-600 dark:text-stone-300">
              Чотири функції та їхні «формули», опис того, як кожен аспект проявляється на кожній функції, і реакції на мінусовий сигнал. Усе перефразовано, не цитується.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Що є моїм формулюванням</dt>
            <dd className="text-stone-600 dark:text-stone-300">
              Тези (+) і (−) — це мої формулювання, складені з урахуванням розбору аспектів у Калінаускаса; профілі типів, ситуативні приклади та правила
              аналізатора повідомлень — також мої, без прямого джерела. Такі блоки позначені словом «Моє». Реакцію конкретної людини вони не прогнозують.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Обмеження</dt>
            <dd className="text-stone-600 dark:text-stone-300">
              У Калінаускаса описано лише чотири функції, тому для кожного типу сайт показує 4 аспекти × (10 тез (+) і 10 тез (−)), разом 1 280 показаних тез для 16 типів (унікальних 640: типи з однаковим аспектом на однаковій функції мають спільні тези).
              Для чотирьох інших аспектів типу тез немає. У розділі «Комунікація» тези під обраний контекст складає мовна модель на основі опису Калінаускаса й кешує; вони мають позначку «ШІ», а за відсутності зв’язку показуються загальні тези. Соціоніка не є науково підтвердженою теорією особистості.
            </dd>
          </div>
        </dl>
        <SourceTag s="Калінаускас" />
        <h3 className="mt-5 mb-2 text-sm font-semibold">Позначки «Джерело»</h3>
        <SourceLegend />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(QUADRAS) as (keyof typeof QUADRAS)[]).map((q) => (
          <Card key={q}>
            <h3 className="mb-2 font-semibold">Квадра {QUADRAS[q].name}</h3>
            <div className="flex flex-wrap gap-2">
              {QUADRAS[q].types.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onPick(c)}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-indigo-500 dark:border-stone-600"
                >
                  <span className="font-mono font-bold">{c}</span> · {SOCIOTYPES[c].nickname}
                </button>
              ))}
            </div>
            <SourceTag s="Калінаускас" />
          </Card>
        ))}
      </div>
    </div>
  )
}
