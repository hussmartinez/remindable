import { describe, expect, it } from '@jest/globals';

import { addUtterance, lastSentences, prune, splitSentences, topicWords, WINDOW_MS, type Utterance } from '../conversation';

const build = (texts: string[], start = 0, step = 1000): Utterance[] =>
  texts.reduce<Utterance[]>((list, t, i) => addUtterance(list, t, start + i * step), []);

describe('conversation', () => {
  it('keeps only the last few minutes', () => {
    const list = build(['one', 'two', 'three'], 0, 60_000);
    expect(prune(list, 2 * 60_000 + WINDOW_MS - 30_000).map((u) => u.text)).toEqual(['three']);
    const added = addUtterance(list, 'later', 10 * WINDOW_MS);
    expect(added.map((u) => u.text)).toEqual(['later']);
  });

  it('merges a repeated or extended final result', () => {
    const list = build(['we went to', 'We went to the beach']);
    expect(list.map((u) => u.text)).toEqual(['We went to the beach']);
    expect(build(['hello', '  ', 'there']).map((u) => u.text)).toEqual(['hello', 'there']);
  });

  it('splits sentences in es, en and ar', () => {
    expect(splitSentences('Hola. ¿Qué tal? Bien')).toEqual(['Hola.', '¿Qué tal?', 'Bien']);
    expect(splitSentences('Hi! How are you?')).toEqual(['Hi!', 'How are you?']);
    expect(splitSentences('مرحبا. كيف حالك؟ بخير')).toEqual(['مرحبا.', 'كيف حالك؟', 'بخير']);
  });

  it('returns the last sentences, newest last', () => {
    const list = build(['First thing. Second thing.', 'Third', 'Fourth one']);
    expect(lastSentences(list, 3)).toEqual(['Second thing.', 'Third', 'Fourth one']);
  });

  it('finds topic words in English, folding plurals', () => {
    const list = build([
      'So my sister is coming on Sunday',
      'Is your sister bringing the kids?',
      'Yes, the kids love the garden',
      'We could have lunch in the garden with my sister',
    ]);
    const topics = topicWords(list, 'en', 3).map((t) => t.word);
    expect(topics[0]).toBe('sister');
    expect(topics).toEqual(expect.arrayContaining(['kids', 'garden']));
    expect(topics).not.toContain('the');
  });

  it('finds topic words in Spanish, ignoring accents for counting', () => {
    const list = build(['El médico dijo que mañana', 'Mañana vamos al medico', 'Y después del médico, comemos']);
    const top = topicWords(list, 'es', 2);
    expect(top[0]).toMatchObject({ word: 'médico', count: 3 });
    expect(top.map((t) => t.word)).toContain('mañana');
  });

  it('finds topic words in Arabic, folding the article', () => {
    const list = build(['سنذهب إلى السوق غدا', 'السوق مزدحم في الصباح', 'نشتري الخبز من سوق المدينة']);
    const top = topicWords(list, 'ar', 1)[0];
    expect(top.count).toBe(3);
    expect(top.word).toBe('السوق');
  });

  it('breaks ties by recency and handles empty input', () => {
    expect(topicWords([], 'en')).toEqual([]);
    const top = topicWords(build(['apples', 'pears']), 'en', 1);
    expect(top[0].word).toBe('pears');
  });
});
