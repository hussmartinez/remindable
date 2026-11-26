import type { Lang } from '@/lib/lang';

/**
 * Language-aware text normalisation shared by word matching, the reverse
 * dictionary and conversation topics. Pure and offline.
 *
 * Accents are folded with an explicit table as well as NFD, because
 * String.prototype.normalize is not available on every Hermes build.
 */

const LATIN: Record<string, string> = {
  á: 'a', à: 'a', ä: 'a', â: 'a', ã: 'a',
  é: 'e', è: 'e', ë: 'e', ê: 'e',
  í: 'i', ì: 'i', ï: 'i', î: 'i',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o', õ: 'o',
  ú: 'u', ù: 'u', ü: 'u', û: 'u',
  ñ: 'n', ç: 'c',
};

// Combining marks: Latin (after NFD) and Arabic tashkeel, Quranic marks and the superscript alef.
const MARKS = /[̀-ͯؐ-ًؚ-ٰٟۖ-ۭ]/g;
const PUNCT = /[.,;:!?¡¿"'“”‘’«»()[\]{}\-–—_/\\…،؛؟*&%$#@+=<>|~^`]/g;

/** Lowercase, strip accents and tashkeel, unify Arabic letter variants, drop punctuation. */
export function normalize(text: string): string {
  let s = text.toLowerCase().replace(/[áàäâãéèëêíìïîóòöôõúùüûñç]/g, (c) => LATIN[c]);
  try {
    s = s.normalize('NFD');
  } catch {
    // Older engines: the table above already covers es/en.
  }
  return s
    .replace(MARKS, '')
    .replace(/ـ/g, '') // tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/['’]/g, '') // don't → dont, so contractions stay one word
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Removes punctuation around a word but keeps its accents, for display. */
export function stripPunct(word: string): string {
  return word.replace(PUNCT, ' ').trim().replace(/\s+/g, '');
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  return n ? n.split(' ') : [];
}

export const ARTICLES: Record<Lang, string[]> = {
  es: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo'],
  en: ['the', 'a', 'an'],
  ar: [],
};

const RAW_STOP: Record<Lang, string> = {
  es: `a al algo algun alguna ahi alli aqui asi aun como con contra cual cuando de del desde donde dos e el ella ellas ellos
    en entre era eran es esa ese eso esta este esto estos estas estaba estoy esta fue fueron ha han hay hasta he la las le les lo los
    mas me mi mis mucho muy nada ni no nos nosotros o os otra otro para pero poco por porque que quien se sea ser si sin sobre
    son su sus tambien tan te tener tengo tiene tienen todo todos tu tus un una uno unos unas usted ustedes y ya yo
    pues vale bueno eh este oye mira sabes entonces vamos claro bien cosa cosas algo hace hacer dice dijo voy va vas
    sirve sirven para usa usan se`,
  en: `a about after again all also am an and any are as at be because been before being but by can could did do does
    doing dont down for from had has have having he her here hers him his how i if in into is it its itself just like me
    more most my no nor not now of off on once only or other our out over own same she should so some such than that the
    their them then there these they this those through to too under until up very was we were what when where which while
    who whom why will with would you your yours yeah yes okay ok um uh oh well really thing things something get got go going
    gonna know think mean said say says one used use im ive its thats youre theyre isnt didnt cant wont lets`,
  ar: `في من على الى إلى عن مع هذا هذه ذلك تلك هو هي انا أنا انت أنت نحن هم كان كانت يكون لا ما لم لن ان أن إن قد ثم او أو و يا كل
    بعض هنا هناك الذي التي الذين عند لكن بل حتى اذا إذا كيف ماذا لماذا متى اين أين نعم جدا جداً ايضا أيضاً فقط شيء له لها به بها
    فيه فيها منه منها انه أنه انها أنها هل اي أي عندي عندك يعني طيب اه آه والله بس كمان شو ايش هيك`,
};

export const STOPWORDS: Record<Lang, Set<string>> = {
  es: new Set(tokenize(RAW_STOP.es)),
  en: new Set(tokenize(RAW_STOP.en)),
  ar: new Set(tokenize(RAW_STOP.ar)),
};

const AR_PREFIXES = ['وال', 'بال', 'كال', 'فال', 'لل', 'ال'];
const AR_SUFFIXES = ['ات', 'ون', 'ين', 'ان', 'ها', 'هم', 'كم'];

/** Removes the Arabic definite article (with an attached و/ب/ك/ف/ل), if what remains is still a word. */
export function stripArabicArticle(token: string): string {
  for (const p of AR_PREFIXES) {
    if (token.startsWith(p) && token.length - p.length >= 2) return token.slice(p.length);
  }
  return token;
}

/**
 * Light stemmer: plural and common suffixes only, so "manzanas" = "manzana",
 * "grapes" = "grape", "تفاحات" = "تفاحه". Deliberately conservative.
 */
export function stem(token: string, lang: Lang): string {
  let t = token;
  if (lang === 'ar') {
    t = stripArabicArticle(t);
    if (t.length > 3 && t[0] === 'و') t = t.slice(1);
    for (const s of AR_SUFFIXES) {
      if (t.endsWith(s) && t.length - s.length >= 3) {
        t = t.slice(0, -s.length);
        break;
      }
    }
    if (t.length > 3 && t.endsWith('ه')) t = t.slice(0, -1);
    return t;
  }
  if (lang === 'en') {
    if (t.length > 4 && t.endsWith('ies')) return t.slice(0, -3) + 'y';
    if (t.length > 5 && t.endsWith('ing')) return t.slice(0, -3);
    if (t.length > 4 && /(ses|xes|ches|shes)$/.test(t)) return t.slice(0, -2);
    if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
    return t;
  }
  if (t.length > 4 && t.endsWith('ces')) return t.slice(0, -3) + 'z';
  if (t.length > 4 && /[^aeiou]es$/.test(t)) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith('s')) return t.slice(0, -1);
  return t;
}

/** Meaningful stems of `text`: normalised, articles and stop words removed, stemmed. */
export function contentStems(text: string, lang: Lang): string[] {
  const stop = STOPWORDS[lang];
  return tokenize(text)
    .filter((t) => !stop.has(t) && !ARTICLES[lang].includes(t))
    .map((t) => stem(t, lang))
    .filter((t) => t.length >= 2 && !stop.has(t));
}

/** Levenshtein distance on code points. */
export function editDistance(a: string, b: string): number {
  const x = Array.from(a);
  const y = Array.from(b);
  if (!x.length) return y.length;
  if (!y.length) return x.length;
  let prev = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[y.length];
}

/** Edit distance divided by the longer length: 0 = identical, 1 = nothing in common. */
export function normalizedDistance(a: string, b: string): number {
  const len = Math.max(Array.from(a).length, Array.from(b).length);
  return len === 0 ? 0 : editDistance(a, b) / len;
}
