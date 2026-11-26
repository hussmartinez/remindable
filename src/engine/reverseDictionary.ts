import { CATEGORIES, CONCEPTS, type CategoryId, type Concept } from '@/content/concepts';
import { LANGS, type Lang } from '@/lib/lang';
import { contentStems, normalizedDistance, STOPWORDS, tokenize } from './textNorm';

/**
 * Tip-of-the-tongue rescue: rank picture concepts from a description built
 * out of tapped clues (group, place, use or look) and optional free text.
 * The same semantic features that drive the Word Garden hint ladder
 * (Semantic Feature Analysis) are searched in reverse, in every language,
 * so a description in one language can find a word in another. Fully local.
 */

/** A tappable clue: keywords searched in concept places and features, in all languages. */
export type Clue = { id: string; words: Record<Lang, string[]> };

export const PLACE_CLUES: Clue[] = [
  { id: 'kitchen', words: { es: ['cocina', 'nevera', 'frutero', 'cajón'], en: ['kitchen', 'fridge', 'fruit bowl', 'drawer'], ar: ['مطبخ', 'ثلاجة', 'سلة الفواكه', 'دُرج'] } },
  { id: 'house', words: { es: ['casa', 'dormitorio', 'sofá', 'pared', 'puerta', 'entrada', 'perchero'], en: ['home', 'house', 'bedroom', 'sofa', 'wall', 'door', 'coat rack'], ar: ['بيت', 'غرفة', 'أريكة', 'حائط', 'باب', 'مدخل', 'مشجب'] } },
  { id: 'outdoors', words: { es: ['bosque', 'parque', 'jardín', 'campo', 'huerto', 'cielo', 'flores'], en: ['forest', 'park', 'garden', 'countryside', 'sky', 'flowers'], ar: ['غابة', 'حديقة', 'ريف', 'بستان', 'سماء', 'أزهار'] } },
  { id: 'farm', words: { es: ['granja', 'establo', 'viña'], en: ['farm', 'stable', 'vineyard'], ar: ['مزرعة', 'إسطبل', 'كرمة'] } },
  { id: 'water', words: { es: ['mar', 'río', 'playa', 'estanque', 'puerto'], en: ['sea', 'river', 'beach', 'pond', 'harbour'], ar: ['بحر', 'نهر', 'شاطئ', 'بركة', 'ميناء'] } },
  { id: 'street', words: { es: ['calle', 'garaje', 'aeropuerto', 'carril'], en: ['street', 'garage', 'airport', 'lane'], ar: ['شارع', 'مرآب', 'مطار', 'مسار'] } },
  { id: 'onYou', words: { es: ['pie', 'cabeza', 'nariz', 'bolsillo'], en: ['foot', 'head', 'nose', 'pocket'], ar: ['قدم', 'رأس', 'أنف', 'جيب'] } },
  { id: 'work', words: { es: ['herramientas', 'laboratorio', 'botiquín', 'mochila'], en: ['toolbox', 'laboratory', 'first-aid', 'backpack'], ar: ['العدة', 'مختبر', 'إسعافات', 'حقيبة'] } },
  { id: 'town', words: { es: ['panadería', 'biblioteca', 'buzón', 'palacio', 'concierto', 'orquesta', 'banda'], en: ['bakery', 'library', 'mailbox', 'palace', 'concert', 'orchestra', 'band'], ar: ['مخبز', 'مكتبة', 'البريد', 'قصر', 'حفلة', 'أوركسترا', 'فرقة'] } },
];

export const USE_CLUES: Clue[] = [
  { id: 'eat', words: { es: ['comer', 'morder', 'sopa', 'harina', 'leche', 'hornea'], en: ['eat', 'bite', 'soup', 'flour', 'milk', 'baked'], ar: ['نأكل', 'طعام', 'حساء', 'طحين', 'حليب', 'يخبز'] } },
  { id: 'wear', words: { es: ['pones', 'llevan'], en: ['wear'], ar: ['نلبس', 'نلبسه', 'نلبسها', 'يلبسه'] } },
  { id: 'open', words: { es: ['abrir', 'abres', 'cierras'], en: ['open', 'close'], ar: ['نفتح', 'نغلق'] } },
  { id: 'see', words: { es: ['ver', 'leer', 'lee', 'páginas'], en: ['see', 'read', 'pages'], ar: ['نرى', 'نقرأ', 'صفحات'] } },
  { id: 'cut', words: { es: ['cortar', 'clavar', 'clavos'], en: ['cut', 'nails', 'hit'], ar: ['نقص', 'ندق', 'مسامير'] } },
  { id: 'light', words: { es: ['luz', 'calor', 'brilla', 'llama'], en: ['light', 'heat', 'shines', 'flame'], ar: ['الضوء', 'الحرارة', 'يضيء', 'تضيء', 'لهب'] } },
  { id: 'travel', words: { es: ['ruedas', 'conduce', 'vuela', 'pedales', 'pasajeros'], en: ['wheels', 'drive', 'flies', 'pedals', 'passengers'], ar: ['عجلات', 'نقودها', 'تطير', 'دواسات', 'المسافرين'] } },
  { id: 'music', words: { es: ['cuerdas', 'toca', 'soplando', 'arco'], en: ['strings', 'play', 'blow', 'bow'], ar: ['أوتار', 'نعزف', 'ننفخ'] } },
  { id: 'measure', words: { es: ['hora', 'mide', 'temperatura', 'norte'], en: ['time', 'measures', 'temperature', 'north'], ar: ['الوقت', 'يقيس', 'درجة', 'الشمال'] } },
  { id: 'alive', words: { es: ['ladra', 'maúlla', 'muge', 'relincha', 'nada', 'salta', 'alas', 'cola'], en: ['barks', 'meows', 'moos', 'neighs', 'swims', 'hops', 'wings', 'tail'], ar: ['ينبح', 'تموء', 'تخور', 'يصهل', 'تسبح', 'يقفز', 'أجنحة', 'ذيله'] } },
  { id: 'yellow', words: { es: ['amarillo', 'amarilla'], en: ['yellow'], ar: ['صفراء', 'أصفر'] } },
  { id: 'red', words: { es: ['roja', 'rojo', 'verde'], en: ['red', 'green'], ar: ['أحمر', 'حمراء', 'أخضر'] } },
  { id: 'long', words: { es: ['largo', 'largas', 'diminutas'], en: ['long', 'tiny'], ar: ['طويلة', 'طويلتان', 'الصغيرة'] } },
];

export type Query = {
  cats?: CategoryId[];
  places?: string[];
  uses?: string[];
  /** Free description, typed or spoken, in any of the three languages. */
  text?: string;
};

export type Candidate = { concept: Concept; score: number };

type Doc = { concept: Concept; word: Set<string>; cat: Set<string>; feature: Set<string>; place: Set<string> };

const stemsAll = (texts: Record<Lang, string>) => new Set(LANGS.flatMap((l) => contentStems(texts[l], l)));

const DOCS: Doc[] = CONCEPTS.map((c) => ({
  concept: c,
  word: stemsAll(c.word),
  cat: stemsAll(CATEGORIES[c.cat]),
  feature: stemsAll(c.feature),
  place: stemsAll(c.place),
}));

/** How many concepts mention each stem: rare words ("barks") say more than common ones ("home"). */
const DF = new Map<string, number>();
for (const d of DOCS) {
  for (const s of new Set([...d.word, ...d.cat, ...d.feature, ...d.place])) DF.set(s, (DF.get(s) ?? 0) + 1);
}
const idf = (s: string) => Math.log(1 + DOCS.length / (DF.get(s) ?? 1));
const MAX_IDF = Math.log(1 + DOCS.length);

/** 1 = same stem, less for a shared beginning or a small typo, 0 = unrelated. */
export function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (short.length >= 4 && long.startsWith(short)) return 0.8;
  if (short.length >= 5 && normalizedDistance(a, b) <= 0.2) return 0.7;
  return 0;
}

function bestIn(stems: Set<string>, q: string): number {
  let best = 0;
  for (const s of stems) {
    const sim = tokenSimilarity(q, s);
    if (sim > 0) best = Math.max(best, (sim * idf(s)) / MAX_IDF);
  }
  return best;
}

const FIELD_WEIGHTS = { word: 5, cat: 3, feature: 2, place: 1.5 } as const;

function textScore(d: Doc, stems: string[]): number {
  let total = 0;
  for (const q of stems) {
    total += Math.max(...(Object.keys(FIELD_WEIGHTS) as (keyof typeof FIELD_WEIGHTS)[]).map((f) => FIELD_WEIGHTS[f] * bestIn(d[f], q)));
  }
  return total;
}

/** A tapped clue counts once, however many of its keywords match. */
function clueScore(d: Doc, clue: Clue, fields: ('feature' | 'place')[]): number {
  const stems = LANGS.flatMap((l) => clue.words[l].flatMap((w) => contentStems(w, l)));
  return stems.some((s) => fields.some((f) => d[f].has(s))) ? 1 : 0;
}

const CLUE_WEIGHT = 2.5;
const CAT_WEIGHT = 4;
/** Below this a candidate is a guess, not a match, and is not shown. */
export const MIN_SCORE = 1;

/** The description may be in any language, so a word that is a stop word in any of them ("para") is dropped. */
function queryStems(text: string): string[] {
  const words = tokenize(text).filter((t) => !LANGS.some((l) => STOPWORDS[l].has(t)));
  return [...new Set(LANGS.flatMap((l) => contentStems(words.join(' '), l)))];
}

export function hasClues(q: Query): boolean {
  return Boolean(q.cats?.length || q.places?.length || q.uses?.length || q.text?.trim());
}

/** Best candidates first; empty when nothing fits well enough (the UI says so honestly). */
export function rankConcepts(q: Query, limit = 4): Candidate[] {
  if (!hasClues(q)) return [];
  const stems = q.text ? queryStems(q.text) : [];
  const places = PLACE_CLUES.filter((c) => q.places?.includes(c.id));
  const uses = USE_CLUES.filter((c) => q.uses?.includes(c.id));

  const scored = DOCS.map((d) => {
    let score = textScore(d, stems);
    if (q.cats?.includes(d.concept.cat)) score += CAT_WEIGHT;
    for (const c of places) score += CLUE_WEIGHT * clueScore(d, c, ['place']);
    for (const c of uses) score += CLUE_WEIGHT * clueScore(d, c, ['feature', 'place']);
    return { concept: d.concept, score };
  }).filter((c) => c.score >= MIN_SCORE);

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]?.score ?? 0;
  // Keep only candidates reasonably close to the best, so a strong match is not buried in noise.
  return scored.filter((c) => c.score >= top * 0.5).slice(0, limit);
}
