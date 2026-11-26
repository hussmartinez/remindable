import { describe, expect, it } from '@jest/globals';

import { CONCEPTS } from '@/content/concepts';
import { LANGS } from '@/lib/lang';
import { addPractice, preferPractice, removePractice } from '../practiceList';
import { PLACE_CLUES, rankConcepts, USE_CLUES, type Query } from '../reverseDictionary';
import { contentStems } from '../textNorm';

const ids = (q: Query) => rankConcepts(q).map((c) => c.concept.id);

describe('reverseDictionary', () => {
  it('finds a word from a free description in each language', () => {
    expect(ids({ text: 'it barks' })[0]).toBe('dog');
    expect(ids({ text: 'ladra mucho' })[0]).toBe('dog');
    expect(ids({ text: 'ينبح' })[0]).toBe('dog');
    expect(ids({ text: 'a yellow fruit you peel' })[0]).toBe('banana');
    expect(ids({ text: 'sirve para medir la temperatura' })[0]).toBe('thermometer');
    expect(ids({ text: 'يقيس درجة الحرارة' })[0]).toBe('thermometer');
  });

  it('finds a word said in another language', () => {
    expect(ids({ text: 'manzana' })[0]).toBe('apple');
    expect(ids({ text: 'it is like "llave"' })[0]).toBe('key');
  });

  it('combines tapped clues', () => {
    expect(ids({ cats: ['animal'], places: ['farm'], uses: ['alive'] })).toEqual(expect.arrayContaining(['cow', 'horse']));
    expect(ids({ cats: ['fruit'], uses: ['yellow'] }).slice(0, 2).sort()).toEqual(['banana', 'lemon']);
    expect(ids({ cats: ['tool'], uses: ['cut'] }).slice(0, 2).sort()).toEqual(['hammer', 'scissors']);
    expect(ids({ cats: ['music'], uses: ['music'], text: 'bow' })[0]).toBe('violin');
  });

  it('every concept can be found from its own feature, in every language', () => {
    for (const c of CONCEPTS) {
      for (const l of LANGS) {
        const found = ids({ cats: [c.cat], text: c.feature[l] });
        expect({ id: c.id, l, found: found.includes(c.id) }).toEqual({ id: c.id, l, found: true });
      }
    }
  });

  it('is honest when nothing fits', () => {
    expect(rankConcepts({})).toEqual([]);
    expect(rankConcepts({ text: 'xyzzy plorf' })).toEqual([]);
    expect(rankConcepts({ text: 'the and of it' })).toEqual([]);
  });

  it('returns at most the limit, best first', () => {
    const r = rankConcepts({ cats: ['animal'] }, 4);
    expect(r.length).toBeLessThanOrEqual(4);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].score).toBeGreaterThanOrEqual(r[i].score);
  });

  it('every clue matches at least one concept', () => {
    for (const clue of [...PLACE_CLUES, ...USE_CLUES]) {
      const field = PLACE_CLUES.includes(clue) ? 'places' : 'uses';
      expect({ clue: clue.id, n: rankConcepts({ [field]: [clue.id] }).length > 0 }).toEqual({ clue: clue.id, n: true });
      for (const l of LANGS) expect(clue.words[l].flatMap((w) => contentStems(w, l)).length).toBeGreaterThan(0);
    }
  });
});

describe('practiceList', () => {
  it('adds newest first without duplicates and removes', () => {
    let d = addPractice({ practice: [] }, 'dog');
    d = addPractice(d, 'cat');
    d = addPractice(d, 'dog');
    expect(d.practice).toEqual(['dog', 'cat']);
    expect(removePractice(d, 'dog').practice).toEqual(['cat']);
    expect(addPractice({ practice: ['a', 'b', 'c'] }, 'd', 3).practice).toEqual(['d', 'a', 'b']);
  });

  it('puts practice words first, then fills from the pool', () => {
    const pool = CONCEPTS.filter((c) => c.tier === 1);
    const picked = preferPractice(['violin', 'nope', 'dog'], CONCEPTS, pool, 5);
    expect(picked.map((c) => c.id).slice(0, 2)).toEqual(['violin', 'dog']);
    expect(picked).toHaveLength(5);
    expect(new Set(picked.map((c) => c.id)).size).toBe(5);
  });
});
