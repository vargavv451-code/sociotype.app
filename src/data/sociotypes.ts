import type {
  AspectCode, Dichotomies, PositionId, QuadraId, Sociotype, TypeCode,
} from './types'

/** Допоміжні функції для виведення моделі А за базовою та творчою функціями. */
const letter = (a: AspectCode) => a[0] as 'N' | 'S' | 'T' | 'F'
const sign = (a: AspectCode) => a[1] as 'e' | 'i'
const flip = (a: AspectCode): AspectCode => `${a[0]}${sign(a) === 'e' ? 'i' : 'e'}` as AspectCode
const partner: Record<'N' | 'S' | 'T' | 'F', 'N' | 'S' | 'T' | 'F'> = { N: 'S', S: 'N', T: 'F', F: 'T' }
const sameSignOther = (a: AspectCode): AspectCode => `${partner[letter(a)]}${sign(a)}` as AspectCode

/**
 * Класична модель А:
 * 1 базова, 2 творча, 3 рольова (інша функція тієї ж групи, що й базова, зі знаком базової),
 * 4 больова (інша функція тієї ж групи, що й творча, зі знаком творчої),
 * 5 сугестивна = протилежна за знаком до рольової, 6 активаційна = протилежна до больової,
 * 7 обмежувальна = протилежна до базової, 8 фонова = протилежна до творчої.
 * Перевірка: базова функція дуала збігається з сугестивною (5) цього типу.
 */
export function buildModel(base: AspectCode, creative: AspectCode): Record<PositionId, AspectCode> {
  const role = sameSignOther(base)
  const pain = sameSignOther(creative)
  return {
    1: base, 2: creative, 3: role, 4: pain,
    5: flip(role), 6: flip(pain), 7: flip(base), 8: flip(creative),
  }
}

function dichotomies(base: AspectCode, creative: AspectCode): Dichotomies {
  const pair = [base, creative]
  const judging = pair.find((a) => letter(a) === 'T' || letter(a) === 'F')!
  const perceiving = pair.find((a) => letter(a) === 'N' || letter(a) === 'S')!
  return {
    ei: sign(base) === 'e' ? 'extravert' : 'introvert',
    lf: letter(judging) === 'T' ? 'logic' : 'ethic',
    sn: letter(perceiving) === 'S' ? 'sensing' : 'intuition',
    rp: letter(base) === 'T' || letter(base) === 'F' ? 'rational' : 'irrational',
  }
}

interface Seed {
  code: TypeCode
  name: string
  nickname: string
  quadra: QuadraId
  base: AspectCode
  creative: AspectCode
  summary: string
}

const SEEDS: Seed[] = [
  { code: 'ILE', name: 'Інтуїтивно-логічний екстраверт', nickname: 'Дон Кіхот', quadra: 'alpha', base: 'Ne', creative: 'Ti',
    summary: 'Тип, у картині світу якого центральне місце посідають можливості, ідеї й нові зв’язки між явищами; їх він упорядковує через логічні схеми.' },
  { code: 'SEI', name: 'Сенсорно-етичний інтроверт', nickname: 'Дюма', quadra: 'alpha', base: 'Si', creative: 'Fe',
    summary: 'Тип, який у першу чергу зважає на комфорт, самопочуття й гармонію оточення та підтримує цілком певну емоційну атмосферу навколо себе.' },
  { code: 'ESE', name: 'Етико-сенсорний екстраверт', nickname: 'Гюго', quadra: 'alpha', base: 'Fe', creative: 'Si',
    summary: 'Тип, який відчуває й створює емоційну атмосферу в групі та дбає про комфорт і затишок людей навколо.' },
  { code: 'LII', name: 'Логіко-інтуїтивний інтроверт', nickname: 'Робесп’єр', quadra: 'alpha', base: 'Ti', creative: 'Ne',
    summary: 'Тип, який шукає внутрішню логіку речей, будує системи та перевіряє їх на несуперечність, залучаючи альтернативні можливості.' },
  { code: 'EIE', name: 'Етико-інтуїтивний екстраверт', nickname: 'Гамлет', quadra: 'beta', base: 'Fe', creative: 'Ni',
    summary: 'Тип, який емоційно залучає людей, пов’язуючи атмосферу моменту з ідеєю, сенсом і баченням майбутнього.' },
  { code: 'LSI', name: 'Логіко-сенсорний інтроверт', nickname: 'Максим Горький', quadra: 'beta', base: 'Ti', creative: 'Se',
    summary: 'Тип, який діє за чіткими правилами й системою, а у відстоюванні порядку спирається на волю й рішучість.' },
  { code: 'SLE', name: 'Сенсорно-логічний екстраверт', nickname: 'Жуков', quadra: 'beta', base: 'Se', creative: 'Ti',
    summary: 'Тип, який діє напряму, відчуває кордони й владу в реальному просторі та вибудовує свої дії за чіткою логікою.' },
  { code: 'IEI', name: 'Інтуїтивно-етичний інтроверт', nickname: 'Єсенін', quadra: 'beta', base: 'Ni', creative: 'Fe',
    summary: 'Тип, який відчуває плин часу й внутрішній сенс подій та виражає їх через настрій, образи й емоції.' },
  { code: 'SEE', name: 'Сенсорно-етичний екстраверт', nickname: 'Наполеон', quadra: 'gamma', base: 'Se', creative: 'Fi',
    summary: 'Тип, який діє рішуче в реальному просторі й одночасно вибудовує особисті стосунки, визначаючи, хто йому близький.' },
  { code: 'ILI', name: 'Інтуїтивно-логічний інтроверт', nickname: 'Бальзак', quadra: 'gamma', base: 'Ni', creative: 'Te',
    summary: 'Тип, який спостерігає за перебігом подій і оцінює, що з них вийде на практиці, спираючись на факти й корисність.' },
  { code: 'LIE', name: 'Логіко-інтуїтивний екстраверт', nickname: 'Джек Лондон', quadra: 'gamma', base: 'Te', creative: 'Ni',
    summary: 'Тип, який орієнтований на практичний результат і ефективність та підкріплює свої дії баченням перспективи.' },
  { code: 'ESI', name: 'Етико-сенсорний інтроверт', nickname: 'Драйзер', quadra: 'gamma', base: 'Fi', creative: 'Se',
    summary: 'Тип, який чітко відчуває особисті стосунки, дистанцію й лояльність і за потреби відстоює їх із твердістю.' },
  { code: 'LSE', name: 'Логіко-сенсорний екстраверт', nickname: 'Штірліц', quadra: 'delta', base: 'Te', creative: 'Si',
    summary: 'Тип, який зосереджений на ефективній роботі й упорядкуванні справ та дбає про практичний, зручний устрій середовища.' },
  { code: 'EII', name: 'Етико-інтуїтивний інтроверт', nickname: 'Достоєвський', quadra: 'delta', base: 'Fi', creative: 'Ne',
    summary: 'Тип, який відчуває особисте ставлення між людьми, тонко реагує на їхню щирість і бачить у людях потенціал.' },
  { code: 'IEE', name: 'Інтуїтивно-етичний екстраверт', nickname: 'Гекслі', quadra: 'delta', base: 'Ne', creative: 'Fi',
    summary: 'Тип, якого цікавить потенціал людей і ідей, і який поєднує пошук можливостей із чутливістю до особистих стосунків.' },
  { code: 'SLI', name: 'Сенсорно-логічний інтроверт', nickname: 'Габен', quadra: 'delta', base: 'Si', creative: 'Te',
    summary: 'Тип, який дбає про фізичний комфорт і зручність та поєднує це з практичною діловитістю й увагою до фактів.' },
]

export const SOCIOTYPES: Record<TypeCode, Sociotype> = Object.fromEntries(
  SEEDS.map((s) => [
    s.code,
    {
      code: s.code,
      name: s.name,
      nickname: s.nickname,
      quadra: s.quadra,
      dichotomies: dichotomies(s.base, s.creative),
      summary: s.summary,
      model: buildModel(s.base, s.creative),
    } satisfies Sociotype,
  ]),
) as Record<TypeCode, Sociotype>

export const TYPE_CODES: TypeCode[] = SEEDS.map((s) => s.code)

export const QUADRAS: Record<QuadraId, { name: string; types: TypeCode[]; note: string }> = {
  alpha: {
    name: 'Альфа',
    types: ['ILE', 'SEI', 'ESE', 'LII'],
    note: 'Квадра об’єднує типи, у яких, за класичним описом, спільні сильні й слабкі аспекти в моделі А.',
  },
  beta: {
    name: 'Бета',
    types: ['EIE', 'LSI', 'SLE', 'IEI'],
    note: 'Квадра об’єднує типи, у яких, за класичним описом, спільні сильні й слабкі аспекти в моделі А.',
  },
  gamma: {
    name: 'Гамма',
    types: ['SEE', 'ILI', 'LIE', 'ESI'],
    note: 'Квадра об’єднує типи, у яких, за класичним описом, спільні сильні й слабкі аспекти в моделі А.',
  },
  delta: {
    name: 'Дельта',
    types: ['LSE', 'EII', 'IEE', 'SLI'],
    note: 'Квадра об’єднує типи, у яких, за класичним описом, спільні сильні й слабкі аспекти в моделі А.',
  },
}

export const DICHOTOMY_LABELS = {
  ei: { extravert: 'Екстраверт', introvert: 'Інтроверт' },
  lf: { logic: 'Логік', ethic: 'Етик' },
  sn: { sensing: 'Сенсорик', intuition: 'Інтуїт' },
  rp: { rational: 'Раціонал', irrational: 'Ірраціонал' },
} as const

export function findSociotype(d: Partial<Dichotomies>): Sociotype | null {
  if (!d.ei || !d.lf || !d.sn || !d.rp) return null
  return (
    TYPE_CODES.map((c) => SOCIOTYPES[c]).find(
      (t) =>
        t.dichotomies.ei === d.ei &&
        t.dichotomies.lf === d.lf &&
        t.dichotomies.sn === d.sn &&
        t.dichotomies.rp === d.rp,
    ) ?? null
  )
}
