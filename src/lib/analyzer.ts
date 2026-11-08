import { K_FUNCTIONS, K_FUNCTION_IDS, kModel } from '../data/kal'
import type { KFunctionId } from '../data/kal/cellTypes'
import type { AspectCode, Sociotype } from '../data/types'

/**
 * Прозорий аналізатор на правилах (без мовної моделі й без зовнішніх запитів).
 * Він шукає в тексті ключові основи слів, які зазвичай пов’язують з певним аспектом,
 * визначає загальний тон фрази й співвідносить його з однією з чотирьох функцій обраного типу за Калінаускасом.
 * Це евристика, а не вимірювання: вона може помилятися й не розуміє іронії та контексту.
 */

export type Tone = 'affirm' | 'support' | 'critical' | 'demand' | 'neutral'
export type Verdict = 'plus' | 'minus' | 'mixed' | 'neutral'

export const TONE_LABEL: Record<Tone, string> = {
  affirm: 'схвальний тон',
  support: 'підтримка або пропозиція',
  critical: 'критичний тон',
  demand: 'вимога або тиск',
  neutral: 'нейтральний тон',
}

const re = (s: string) => new RegExp(`(?<![\\p{L}])(?:${s})`, 'iu')

const ASPECT_LEXICON: Record<AspectCode, RegExp> = {
  Ne: re('ідеї|ідей|ідея|ідею|можливост|варіант|альтернатив|потенціал|експеримент|нестандарт|творч|уяв|фантаз|спробува|незвичн|оригінальн|нове|новий|нову|нових|а що,? якщо'),
  Ni: re('майбутн|передчутт|інтуїц|наслідк|перспектив|сенс|символ|згодом|прогноз|передбач|знак[иі]|доля|долі|куди все йде|час покаже|розвиток подій'),
  Se: re('сила|силу|силою|сильн|воля|волю|волев|рішуч|змагань|перемог|кордон|територ|тиск|наказ|боротьб|влада|владу|лідер|напор|відстоюв|виклик|конкуренц|прямо'),
  Si: re('комфорт|затишн|смачн|їжа|їжу|їжі|їсти|запах|аромат|сон|спати|втомл|здоров|самопочутт|тіло|тілесн|масаж|відпочи|естетик|дизайн|чай|кава|каву|одяг|зручн'),
  Te: re('факт|дані|даних|цифр|результат|ефективн|користь|користі|вигод|термін|дедлайн|бюджет|гроші|грошей|витрат|прибут|продуктивн|інструкц|практичн|завдання|ресурс|статистик|показник|економ'),
  Ti: re('логік|логічн|систем|структур|принцип|визначення|класифікац|послідовн|суперечн|аргумент|доказ|доведи|причин|закономірн|правил|точн|модел|схем|аналіз'),
  Fe: re('емоці|настрій|настрої|веселощ|радіс|сміх|смійся|свято|свят|ентузіаз|захоплен|атмосфер|вечірк|жарт|драм|вражен|зворуш|веселий|веселі|натхненн'),
  Fi: re('довір|лояльн|щирост|щирий|щире|щиро|прихильн|стосунк|ставлення|відданіст|зрад|вірніст|близьк|дистанц|повага|повагу|поважа|друж|кохан|любов|образа|образи|образив|совіст|мораль|порядн'),
}

const NEGATION = re('не\\s+(?:\\p{L}+\\s+)?(?:чудов|прекрасн|гарн|класн|супер|цінн|вражає|подоба|відмінн|добре|приємно|корисн|допомож|підтрим)')
const AFFIRM = re('чудов|прекрасн|гарн|класн|супер|цінн|дякую|вдячн|молодець|вражає|подоба|люблю|захоплююс|круто|відмінн|добре|приємно|корисн|цікав')
const SUPPORT = re('допоможу|допомож|підтрим|разом|давай|можна спробувати|запрошую|пропоную|без поспіху|не поспішай|розумію|поруч')
const CRITICAL = re('погано|жахлив|дурн|безглузд|нікчем|ненавиджу|ненавидиш|нікуди не годит|ганьб|огидн|безнадійн|марн|нереальн|нісенітн|ти завжди|ти ніколи|чому ти не|смішн')
const DEMAND = re('маєш|мусиш|зобов’яз|зобов\'яз|негайно|терміново|зараз же|вимагаю|нарешті|швидше|ти повинен|ти повинна|відповідай')

export function detectAspects(text: string): AspectCode[] {
  return (Object.keys(ASPECT_LEXICON) as AspectCode[]).filter((a) => ASPECT_LEXICON[a].test(text))
}

export function detectTone(text: string): Tone {
  if (DEMAND.test(text)) return 'demand'
  if (CRITICAL.test(text) || NEGATION.test(text)) return 'critical'
  if (SUPPORT.test(text)) return 'support'
  if (AFFIRM.test(text)) return 'affirm'
  return 'neutral'
}

export function classifyK(fn: KFunctionId, tone: Tone): { verdict: Verdict; note: string } {
  const f = K_FUNCTIONS[fn]
  switch (tone) {
    case 'neutral':
      return {
        verdict: 'neutral',
        note: 'Фраза лише торкається теми аспекту. Без схвального, критичного чи вимогливого тону її не можна віднести ні до плюса, ні до мінуса.',
      }
    case 'critical':
    case 'demand':
      return {
        verdict: 'minus',
        note: `${tone === 'critical' ? 'Критичний тон' : 'Вимога або тиск'} у темі функції «${f.name}». За Калінаускасом, мінусовий сигнал на цю функцію: ${f.minusSign.charAt(0).toLowerCase()}${f.minusSign.slice(1)}`,
      }
    case 'affirm':
    case 'support':
      return {
        verdict: 'plus',
        note: `${tone === 'affirm' ? 'Схвальна фраза' : 'Підтримка або пропозиція'} у темі функції «${f.name}». ${f.purpose}`,
      }
  }
}

export interface ClauseAnalysis {
  text: string
  tone: Tone
  aspects: {
    aspect: AspectCode
    kfunction?: KFunctionId
    verdict: Verdict
    note: string
  }[]
}

export function splitClauses(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+|\n+|;/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function analyzeMessage(text: string, type: Sociotype | null): ClauseAnalysis[] {
  const model = type ? kModel(type) : null
  return splitClauses(text).map((clause) => {
    const tone = detectTone(clause)
    const aspects = detectAspects(clause).map((aspect) => {
      if (!model) {
        return {
          aspect,
          verdict: 'neutral' as Verdict,
          note: 'Соціотип не обрано, тому функцію за Калінаускасом визначити не можна: показано лише, яку тему зачіпає фраза.',
        }
      }
      const fn = K_FUNCTION_IDS.find((f) => model[f] === aspect)
      if (!fn) {
        return {
          aspect,
          verdict: 'neutral' as Verdict,
          note: 'Цей аспект не входить до чотирьох функцій Калінаускаса для обраного типу, тому реакцію на нього сайт не оцінює.',
        }
      }
      const { verdict, note } = classifyK(fn, tone)
      return { aspect, kfunction: fn, verdict, note }
    })
    return { text: clause, tone, aspects }
  })
}
