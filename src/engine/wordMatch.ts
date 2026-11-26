import type { Lang } from '@/lib/lang';
import { ARTICLES, normalizedDistance, stem, tokenize } from './textNorm';

/**
 * Forgiving comparison between what the speech recogniser heard and the
 * target word. People with word-finding problems often wrap the word in a
 * sentence ("I think it's an apple"), say a plural, or the recogniser
 * mishears one sound. All of that should still count. Only the word itself
 * matters, never pronunciation quality.
 */

/** Largest normalised edit distance still accepted. 0.25 = one slip in four letters; short words must be exact. */
export const MAX_DISTANCE = 0.25;

/**
 * Everyday or regional synonyms that should also count, by concept id.
 * Kept small and conservative: only names a speaker would really use for the picture.
 */
export const ALIASES: Partial<Record<string, Partial<Record<Lang, string[]>>>> = {
  banana: { es: ['banana', 'banano', 'cambur'], ar: ['موز'] },
  car: { es: ['carro', 'auto', 'automóvil'], ar: ['عربية'] },
  glasses: { es: ['lentes', 'anteojos'], en: ['spectacles', 'specs'] },
  airplane: { en: ['plane', 'aeroplane'], es: ['aeroplano'] },
  bicycle: { en: ['bike'], es: ['bici'] },
  rabbit: { en: ['bunny'] },
  cat: { ar: ['قط', 'هرة', 'بسة'] },
  umbrella: { ar: ['شمسية'] },
  guitar: { ar: ['جيتار'] },
  violin: { ar: ['كمنجة'] },
  shoe: { ar: ['جزمة', 'كندرة'] },
  thermometer: { ar: ['ترمومتر', 'مقياس حرارة'] },
};

export function targetsFor(conceptId: string, word: string, lang: Lang): string[] {
  return [word, ...(ALIASES[conceptId]?.[lang] ?? [])];
}

/** Normalised, article-free, stemmed tokens. */
export function matchKey(text: string, lang: Lang): string[] {
  return tokenize(text)
    .filter((t) => !ARTICLES[lang].includes(t))
    .map((t) => stem(t, lang))
    .filter(Boolean);
}

/** Arabic feminine ة/ه is often dropped or added (قطة / قط), so compare both forms. */
function variants(s: string, lang: Lang): string[] {
  return lang === 'ar' && s.length > 2 && s.endsWith('ه') ? [s, s.slice(0, -1)] : [s];
}

/** Best distance between `target` and any run of words in `heard` (windows of n-1..n+1 words, spaces ignored). */
export function bestDistance(heard: string, target: string, lang: Lang): number {
  const t = matchKey(target, lang);
  const h = matchKey(heard, lang);
  if (!t.length || !h.length) return 1;
  const targetForms = variants(t.join(''), lang);
  let best = 1;
  for (let size = Math.max(1, t.length - 1); size <= t.length + 1; size++) {
    for (let i = 0; i + size <= h.length; i++) {
      for (const w of variants(h.slice(i, i + size).join(''), lang)) {
        for (const tf of targetForms) best = Math.min(best, normalizedDistance(w, tf));
      }
    }
  }
  return best;
}

export type MatchResult = { match: boolean; distance: number };

/**
 * Does any recogniser alternative contain one of the `targets`?
 * `others` are the other words on screen: if what was heard is clearly closer to
 * one of them, it is not counted as the target ("cat" must not pass for "car").
 */
export function matchSpoken(heard: string[], targets: string[], lang: Lang, others: string[] = []): MatchResult {
  let distance = 1;
  let rival = 1;
  for (const h of heard) {
    for (const t of targets) distance = Math.min(distance, bestDistance(h, t, lang));
    for (const o of others) rival = Math.min(rival, bestDistance(h, o, lang));
  }
  const match = distance <= MAX_DISTANCE && !(rival < distance);
  return { match, distance };
}
