import { describe, expect, it } from '@jest/globals';

import { SCRIPTS } from '@/content/scripts';
import { LANGS } from '@/lib/lang';
import { correctOrder, disjoint, isValidOrder, makeRounds, nextOptions, scoreOrder, stepsConfig, subsample, type OrderRound } from '../steps';

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

describe('step scripts', () => {
  it('has about 18 scripts of 3–6 steps, translated in every language', () => {
    expect(SCRIPTS.length).toBeGreaterThanOrEqual(18);
    expect(new Set(SCRIPTS.map((s) => s.id)).size).toBe(SCRIPTS.length);
    for (const s of SCRIPTS) {
      expect(s.steps.length).toBeGreaterThanOrEqual(3);
      expect(s.steps.length).toBeLessThanOrEqual(6);
      for (const st of [...s.steps, s.intruder]) {
        expect(st.emoji.length).toBeGreaterThan(0);
        for (const l of LANGS) expect(st.text[l].trim().length).toBeGreaterThan(0);
      }
      for (const l of LANGS) expect(s.title[l].length).toBeGreaterThan(0);
    }
  });

  it('keeps intruders unrelated to every real step', () => {
    const stepEmoji = new Set(SCRIPTS.flatMap((s) => s.steps.map((x) => x.emoji)));
    for (const s of SCRIPTS) expect(stepEmoji.has(s.intruder.emoji)).toBe(false);
    expect(new Set(SCRIPTS.map((s) => s.intruder.emoji)).size).toBe(SCRIPTS.length);
  });

  it('has enough long scripts for six-step rounds', () => {
    expect(SCRIPTS.filter((s) => s.steps.length >= 6).length).toBeGreaterThanOrEqual(3);
  });
});

describe('step levels', () => {
  const size = (lv: number) => {
    const c = stepsConfig(lv, 'keepSharp');
    // Cards on screen: steps plus any intruder.
    return Math.max(...c.rounds.map((r) => (r.kind === 'interleave' ? r.a + r.b : r.steps + (r.kind === 'order' && r.intruder ? 1 : 0))));
  };
  it('grows from 3 steps to intruders, missing steps and interleaving', () => {
    for (let lv = 2; lv <= 10; lv++) expect(size(lv)).toBeGreaterThanOrEqual(size(lv - 1));
    expect(stepsConfig(1, 'keepSharp').rounds.every((r) => r.kind === 'order' && r.steps === 3)).toBe(true);
    expect(stepsConfig(5, 'keepSharp').rounds.some((r) => r.kind === 'order' && r.intruder)).toBe(true);
    expect(stepsConfig(7, 'keepSharp').rounds.some((r) => r.kind === 'missing')).toBe(true);
    expect(stepsConfig(9, 'keepSharp').rounds.some((r) => r.kind === 'interleave')).toBe(true);
  });

  it('keeps Rebuild to 3–4 steps with the first card placed', () => {
    for (const lv of LEVELS) {
      const c = stepsConfig(lv, 'rebuild');
      expect(c.prePlace && c.errorless).toBe(true);
      for (const r of c.rounds) {
        expect(r.kind).toBe('order');
        if (r.kind === 'order') expect([3, 4]).toContain(r.steps);
      }
    }
  });
});

describe('step rounds', () => {
  it('builds solvable order rounds that start scrambled', () => {
    for (const profile of ['keepSharp', 'rebuild'] as const)
      for (const lv of LEVELS)
        for (let i = 0; i < 10; i++)
          for (const r of makeRounds(stepsConfig(lv, profile), SCRIPTS)) {
            if (r.kind !== 'order') continue;
            const real = r.pool.filter((c) => c.index >= 0);
            expect(real.length + (r.prePlaced ? 1 : 0)).toBe(r.slots);
            expect(r.pool.filter((c) => c.index < 0).length).toBeLessThanOrEqual(1);
            expect(isValidOrder(correctOrder(r))).toBe(true);
            expect(new Set(r.pool.map((c) => c.id)).size).toBe(r.pool.length);
            if (r.pool.length >= 2) expect(isValidOrder(r.pool.filter((c) => c.index >= 0))).toBe(false);
            if (r.scripts.length === 2) expect(disjoint(r.scripts[0], r.scripts[1])).toBe(true);
          }
  });

  it('uses different scripts within a session', () => {
    for (let i = 0; i < 20; i++) {
      const ids = makeRounds(stepsConfig(10, 'keepSharp'), SCRIPTS).flatMap((r) => (r.kind === 'order' ? r.scripts.map((s) => s.id) : [r.script.id]));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('builds missing-step rounds with one right, unambiguous answer', () => {
    for (let i = 0; i < 50; i++) {
      for (const r of makeRounds(stepsConfig(8, 'keepSharp'), SCRIPTS)) {
        if (r.kind !== 'missing') continue;
        const gap = r.shown.indexOf(null);
        expect(gap).toBeGreaterThan(0);
        expect(gap).toBeLessThan(r.shown.length - 1);
        expect(r.options.filter((o) => o.id === r.answer.id)).toHaveLength(1);
        expect(new Set(r.options.map((o) => o.text.en)).size).toBe(r.options.length);
        // Distractors are either already shown or not from this script at all.
        for (const o of r.options.filter((x) => x.id !== r.answer.id)) {
          const shown = r.shown.some((c) => c?.id === o.id);
          expect(shown || o.index === -1).toBe(true);
        }
      }
    }
  });
});

describe('step scoring', () => {
  const round = makeRounds({ rounds: [{ kind: 'interleave', a: 3, b: 3 }], errorless: false, prePlace: false }, SCRIPTS)[0] as OrderRound;
  const [a, b] = round.scripts.map((s) => correctOrder({ ...round, scripts: [s] }));

  it('accepts any interleaving that keeps each script in order', () => {
    expect(isValidOrder([...a, ...b])).toBe(true);
    expect(isValidOrder([a[0], b[0], a[1], b[1], b[2], a[2]])).toBe(true);
  });

  it('marks swapped steps and intruders wrong', () => {
    expect(scoreOrder([a[1], a[0], a[2]])).toEqual([false, false, true]);
    const intruder = { ...a[0], id: 'x', index: -1 };
    expect(scoreOrder([a[0], intruder, a[1]])).toEqual([true, false, true]);
  });

  it('offers only valid next cards for errorless placement', () => {
    const next = nextOptions([], round);
    expect(next.map((c) => c.index)).toEqual([0, 0]);
    expect(nextOptions([a[0]], round).map((c) => c.id).sort()).toEqual([a[1].id, b[0].id].sort());
  });

  it('subsamples a consecutive run of steps, so no precondition goes missing', () => {
    const long = SCRIPTS.find((s) => s.steps.length === 6)!;
    for (let i = 0; i < 20; i++) {
      const short = subsample(long, 4);
      expect(short.steps).toHaveLength(4);
      const idx = short.steps.map((st) => long.steps.indexOf(st));
      idx.forEach((v, j) => j > 0 && expect(v).toBe(idx[j - 1] + 1));
    }
  });
});
