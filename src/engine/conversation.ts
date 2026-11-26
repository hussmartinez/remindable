import type { Lang } from '@/lib/lang';
import { normalize, stem, STOPWORDS, stripPunct } from './textNorm';

/**
 * "Where were we?": a short rolling memory of the conversation, kept only in
 * RAM, and a local recap (last sentences + topic words). After a brain injury,
 * losing the thread is common; seeing the last few sentences and the words the
 * talk keeps returning to is an external memory aid, not a transcript.
 */

export type Utterance = { text: string; at: number };

/** Only the last few minutes are kept. Older speech is dropped, never stored. */
export const WINDOW_MS = 5 * 60 * 1000;

export function prune(list: Utterance[], now: number, windowMs = WINDOW_MS): Utterance[] {
  return list.filter((u) => now - u.at <= windowMs);
}

export function addUtterance(list: Utterance[], text: string, now: number, windowMs = WINDOW_MS): Utterance[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return prune(list, now, windowMs);
  const last = list[list.length - 1];
  // Some recognisers repeat the previous final result, or extend it; keep the longer one.
  if (last && normalize(clean).startsWith(normalize(last.text))) {
    return prune([...list.slice(0, -1), { text: clean, at: now }], now, windowMs);
  }
  return prune([...list, { text: clean, at: now }], now, windowMs);
}

/** Splits on sentence punctuation (es/en/ar). Recognisers without punctuation give one sentence per result. */
export function splitSentences(text: string): string[] {
  return (text.match(/[^.!?؟\n]+[.!?؟]*/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

export function lastSentences(list: Utterance[], n = 3): string[] {
  return list.flatMap((u) => splitSentences(u.text)).slice(-n);
}

export type Topic = { word: string; key: string; count: number };

const MIN_LETTERS = 3;

/**
 * Most frequent meaningful words: stop words dropped, plurals folded together,
 * shown in the form the speaker used most. Ties go to the most recent word,
 * because that is closest to where the conversation is now.
 */
export function topicWords(list: Utterance[], lang: Lang, n = 5): Topic[] {
  const stop = STOPWORDS[lang];
  const stats = new Map<string, { count: number; last: number; forms: Map<string, number> }>();
  let pos = 0;
  for (const u of list) {
    for (const raw of u.text.split(/\s+/)) {
      pos += 1;
      const norm = normalize(raw).replace(/ /g, '');
      if (Array.from(norm).length < MIN_LETTERS || stop.has(norm) || /^\d+$/.test(norm)) continue;
      const key = stem(norm, lang);
      if (stop.has(key)) continue;
      const surface = stripPunct(raw.toLowerCase());
      const s = stats.get(key) ?? { count: 0, last: 0, forms: new Map() };
      s.count += 1;
      s.last = pos;
      s.forms.set(surface, (s.forms.get(surface) ?? 0) + 1);
      stats.set(key, s);
    }
  }
  return [...stats.entries()]
    .sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last)
    .slice(0, n)
    .map(([key, s]) => ({
      key,
      count: s.count,
      word: [...s.forms.entries()].sort((a, b) => b[1] - a[1])[0][0],
    }));
}
