import type { Lang } from '@/lib/lang';
import {
  arabicProfile,
  englishProfile,
  matchTolerantly,
  spanishProfile,
  type LanguageProfile,
} from '@hussmartinez/learn-sdk';


/**
 * Forgiving comparison between what the speech recogniser heard and the
 * target word. People with word-finding problems often wrap the word in a
 * sentence ("I think it's an apple"), say a plural, or the recogniser
 * mishears one sound. All of that should still count. Only the word itself
 * matters, never pronunciation quality.
 */

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

/** learn-sdk's built-in profiles: normalisation, articles and plural stems per language. */
export const PROFILES: Record<Lang, LanguageProfile> = {
  es: spanishProfile,
  en: englishProfile,
  ar: arabicProfile,
};

export type MatchResult = { match: boolean; distance: number };

/**
 * Does any recogniser alternative contain one of the `targets`?
 * `others` are the other words on screen: if what was heard is clearly closer to
 * one of them, it is not counted as the target ("cat" must not pass for "car").
 * Matching is learn-sdk's `matchTolerantly`; Remindable only adds its synonym lists.
 */
export function matchSpoken(heard: string[], targets: string[], lang: Lang, others: string[] = []): MatchResult {
  if (heard.every((h) => !h.trim())) return { match: false, distance: 1 };
  return matchTolerantly(heard, targets, { profile: PROFILES[lang], others });
}
