import { describe, expect, it } from '@jest/globals';

import { CONCEPTS, TAG_KIND, conceptById, type GroupTag } from '@/content/concepts';
import { oddOneOut as strings } from '@/i18n/games/oddOneOut';
import { LANGS, type Lang } from '@/lib/lang';
import {
  KIND_ORDER,
  RELATION_TIER,
  buildItems,
  definite,
  explainAnalogy,
  explainOdd,
  groupsOf,
  isAmbiguous,
  joinList,
  makeAnalogy,
  makeOddItem,
  relationPairs,
  roundSpecs,
  type AnalogyItem,
  type Kind,
  type OddItem,
} from '../oddOneOut';

const RUNS = 150;

/** Minimal translator over this game's string table, so tests don't need the i18n runtime. */
function tFor(lang: Lang) {
  return (key: string, opts: Record<string, string> = {}) => {
    const path = key.replace(/^oddOneOut\./, '').split('.');
    let v: unknown = strings[lang];
    for (const p of path) v = (v as Record<string, unknown>)?.[p];
    if (typeof v !== 'string') throw new Error(`missing ${lang}:${key}`);
    return v.replace(/{{(\w+)}}/g, (_, k: string) => opts[k] ?? '');
  };
}

const sharesGroup = (c: (typeof CONCEPTS)[number], g: string) => groupsOf(c).includes(g as never);

describe('odd one out items', () => {
  const kinds: Kind[] = KIND_ORDER;
  for (const kind of kinds) {
    for (const n of [3, 4, 5]) {
      it(`${kind} with ${n} cards: exactly one odd card, never ambiguous`, () => {
        for (let i = 0; i < RUNS; i++) {
          const item = makeOddItem(kind, n);
          if (!item) continue;
          expect(item.cards).toHaveLength(n);
          expect(new Set(item.cards.map((c) => c.id)).size).toBe(n);
          const odd = item.cards.filter((c) => !sharesGroup(c, item.group));
          expect(odd.map((c) => c.id)).toEqual([item.oddId]);
          // The odd card does not even loosely fit the group.
          expect(odd[0].borderline ?? []).not.toContain(item.group);
          // No other set of n − 1 cards shares a group that the odd card is part of.
          expect(isAmbiguous(item.cards, item.oddId)).toBe(false);
          // The contrast used in the feedback belongs to the odd card and to no member.
          expect(groupsOf(odd[0])).toContain(item.contrast);
          item.cards.filter((c) => c.id !== item.oddId).forEach((c) => {
            expect(sharesGroup(c, item.contrast)).toBe(false);
            expect(c.borderline ?? []).not.toContain(item.contrast);
          });
        }
      });
    }
  }

  it('can always build the kinds each level asks for', () => {
    for (const kind of kinds) expect(makeOddItem(kind, 4)).not.toBeNull();
    for (const kind of ['taxo', 'theme', 'abstract'] as Kind[]) expect(makeOddItem(kind, 5)).not.toBeNull();
    expect(makeOddItem('taxo', 3, { tiers: [1] })).not.toBeNull();
  });

  it('flags a card that could also be the odd one', () => {
    const [apple, banana, strawberry, car] = ['apple', 'banana', 'strawberry', 'car'].map((id) => conceptById(id)!);
    // Red: apple, strawberry, car. But banana, apple and strawberry are all fruit, so the car also "doesn't belong".
    expect(isAmbiguous([apple, strawberry, car, banana], 'banana')).toBe(true);
  });

  it('rebuild items are 3 cards, category only, common words at low levels', () => {
    for (let i = 0; i < 30; i++) {
      const items = buildItems(1, 'rebuild') as OddItem[];
      expect(items).toHaveLength(5);
      for (const item of items) {
        expect(item.mode).toBe('odd');
        expect(item.kind).toBe('taxo');
        expect(item.cards).toHaveLength(3);
        item.cards.forEach((c) => expect(c.tier).toBe(1));
      }
    }
  });
});

describe('analogies', () => {
  const types = Object.keys(RELATION_TIER) as (keyof typeof RELATION_TIER)[];

  it('every relation points to a real concept and has every language', () => {
    for (const c of CONCEPTS) {
      for (const r of c.relations ?? []) {
        expect(conceptById(r.to)).toBeDefined();
        if (r.lure) expect(conceptById(r.lure)).toBeDefined();
        LANGS.forEach((l) => expect(r.why[l]).toBeTruthy());
      }
    }
    for (const t of types) expect(relationPairs().filter((p) => p.type === t).length).toBeGreaterThanOrEqual(3);
  });

  it('has the answer among 3 distinct options, and no other option fits the same relation', () => {
    const pairs = relationPairs();
    for (const type of types) {
      for (let i = 0; i < RUNS; i++) {
        const item = makeAnalogy(type, i % 2 === 0) as AnalogyItem;
        expect(item).not.toBeNull();
        const ids = item.options.map((o) => o.id);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);
        expect(ids).toContain(item.answerId);
        expect(item.a1.id).not.toBe(item.a2.id);
        expect(item.b1.id).not.toBe(item.answerId);
        for (const o of item.options) {
          if (o.id === item.answerId) continue;
          // No defined relation of any type links a2 to a distractor (lures are written to be wrong).
          const linked = pairs.some((p) => p.from.id === item.a2.id && p.to.id === o.id);
          expect(linked).toBe(false);
          const rel = item.a2.relations?.find((r) => r.type === type);
          expect(rel?.avoid ?? []).not.toContain(o.id);
          expect([item.a1.id, item.b1.id, item.a2.id]).not.toContain(o.id);
        }
      }
    }
  });
});

describe('levels', () => {
  const rank = (level: number) => {
    const specs = roundSpecs(level, 'keepSharp');
    const analogies = specs.filter((s) => s.mode === 'analogy');
    const odd = specs.filter((s) => s.mode === 'odd');
    const maxKind = Math.max(-1, ...odd.map((s) => (s.mode === 'odd' ? KIND_ORDER.indexOf(s.kind) : -1)));
    const maxTier = Math.max(0, ...analogies.map((s) => (s.mode === 'analogy' ? s.maxTier : 0)));
    return { analogies: analogies.length, maxKind, maxTier, cards: Math.max(0, ...odd.map((s) => (s.mode === 'odd' ? s.n : 0))) };
  };

  it('difficulty grows with level for Keep Sharp', () => {
    for (let l = 2; l <= 10; l++) {
      const a = rank(l - 1);
      const b = rank(l);
      expect(b.analogies).toBeGreaterThanOrEqual(a.analogies);
      if (b.analogies === 0) {
        expect(b.maxKind).toBeGreaterThanOrEqual(a.maxKind);
        expect(b.cards).toBeGreaterThanOrEqual(a.cards);
      }
      expect(b.maxTier).toBeGreaterThanOrEqual(a.maxTier);
    }
    expect(rank(1).cards).toBe(4);
    expect(rank(5).cards).toBe(5);
    expect(rank(10).maxTier).toBe(4);
  });

  it('builds a full session at every level and profile', () => {
    for (const profile of ['keepSharp', 'rebuild'] as const) {
      for (let l = 1; l <= 10; l++) {
        for (let i = 0; i < 10; i++) expect(buildItems(l, profile).length).toBe(roundSpecs(l, profile).length);
      }
    }
  });

  it('never repeats an analogy question in a session', () => {
    for (let i = 0; i < 30; i++) {
      const a2 = buildItems(10, 'keepSharp').map((it) => (it as AnalogyItem).a2.id);
      expect(new Set(a2).size).toBe(a2.length);
    }
  });
});

describe('feedback text', () => {
  it('names the shared group and the odd card in every language', () => {
    for (let i = 0; i < RUNS; i++) {
      const kind = KIND_ORDER[i % KIND_ORDER.length];
      const item = makeOddItem(kind, 4);
      if (!item) continue;
      for (const l of LANGS) {
        const text = explainOdd(item, l, tFor(l));
        expect(text).not.toMatch(/{{|undefined/);
        const odd = item.cards.find((c) => c.id === item.oddId)!;
        expect(text).toContain(l === 'ar' ? definite(odd, l) : odd.word[l]);
      }
    }
  });

  it('has labels for every group', () => {
    const groups = [...Object.keys(TAG_KIND), 'fruit', 'food', 'animal', 'tool', 'clothing', 'vehicle', 'music', 'body', 'home'];
    for (const l of LANGS) {
      for (const g of groups) {
        const label = (strings[l].g as Record<string, { are: string; isA: string }>)[g as GroupTag];
        expect(label?.are).toBeTruthy();
        expect(label?.isA).toBeTruthy();
      }
    }
  });

  it('builds natural lists and definite nouns', () => {
    const [apple, banana, grapes, hammer] = ['apple', 'banana', 'grapes', 'hammer'].map((id) => conceptById(id)!);
    const item: OddItem = { mode: 'odd', kind: 'taxo', group: 'fruit', cards: [apple, banana, grapes, hammer], oddId: 'hammer', contrast: 'tool' };
    expect(explainOdd(item, 'en', tFor('en'))).toBe('Apple, banana and grapes are fruit. The hammer is a tool.');
    expect(explainOdd(item, 'es', tFor('es'))).toBe('La manzana, el plátano y las uvas son frutas. El martillo es una herramienta.');
    expect(explainOdd(item, 'ar', tFor('ar'))).toBe('التفاحة والموزة والعنب كلها فواكه. المطرقة أداة.');
    expect(definite(conceptById('thermometer')!, 'ar')).toBe('ميزان الحرارة');
    expect(joinList(['a', 'b'], 'es')).toBe('a y b');
    const analogy = makeAnalogy('gives', false)!;
    expect(explainAnalogy(analogy, 'en').split('. ')).toHaveLength(2);
  });
});
