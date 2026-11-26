/**
 * Words the user rescued with Word Finder and asked to practise. Word Garden
 * picks these first: practising words the person actually needed in daily life
 * is more motivating and transfers better than practising a fixed list.
 */

export const WORD_FINDER_KEY = 'wordFinder';
export const MAX_PRACTICE = 12;

export type WordFinderData = { practice: string[] };
export const EMPTY_WORD_FINDER: WordFinderData = { practice: [] };

/** Newest first, no duplicates, capped. */
export function addPractice(data: WordFinderData, id: string, max = MAX_PRACTICE): WordFinderData {
  return { ...data, practice: [id, ...data.practice.filter((x) => x !== id)].slice(0, max) };
}

/** A word leaves the list once it has been named in Word Garden. */
export function removePractice(data: WordFinderData, id: string): WordFinderData {
  return { ...data, practice: data.practice.filter((x) => x !== id) };
}

/**
 * Up to `n` items: practice-list items first (in list order), then the rest of
 * `pool` in its given (shuffled) order.
 */
export function preferPractice<T extends { id: string }>(practice: string[], all: readonly T[], pool: readonly T[], n: number): T[] {
  const preferred = practice.map((id) => all.find((c) => c.id === id)).filter((c): c is T => Boolean(c)).slice(0, n);
  const rest = pool.filter((c) => !preferred.some((p) => p.id === c.id));
  return [...preferred, ...rest].slice(0, n);
}
