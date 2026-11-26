import { describe, expect, it } from '@jest/globals';

import {
  generatePattern,
  isPossibleContinuation,
  isUnambiguous,
  optionCount,
  predictNext,
  RENDERED,
  ruleExample,
  RULES,
  sameTile,
  stepStair,
  whyChoices,
  type RuleKind,
} from '../patterns';

/** Small seeded PRNG (mulberry32) so failures are reproducible. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('pattern generator', () => {
  it('always has the answer exactly once among distinct options, and no distractor also fits', () => {
    const rand = seeded(1);
    for (const level of LEVELS) {
      for (const n of [2, 3, 4]) {
        for (let k = 0; k < 60; k++) {
          const item = generatePattern(level, n, rand);
          expect(item.options).toHaveLength(n);
          expect(item.options.filter((o) => sameTile(o, item.answer))).toHaveLength(1);
          for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) expect(sameTile(item.options[i], item.options[j])).toBe(false);
          expect(isUnambiguous(item.series, item.answer, item.kind)).toBe(true);
          for (const o of item.options) {
            if (!sameTile(o, item.answer)) expect(isPossibleContinuation(item.series, item.answer, o, item.kind)).toBe(false);
          }
        }
      }
    }
  });

  it('shows 4–7 tiles and distractors differ from the answer in a drawn attribute', () => {
    const rand = seeded(2);
    for (const level of LEVELS) {
      for (let k = 0; k < 40; k++) {
        const item = generatePattern(level, 4, rand);
        expect(item.series.length).toBeGreaterThanOrEqual(4);
        expect(item.series.length).toBeLessThanOrEqual(7);
        for (const o of item.options) {
          if (sameTile(o, item.answer)) continue;
          expect(RENDERED[item.kind].some((a) => o[a] !== item.answer[a])).toBe(true);
        }
        if (item.kind === 'dots') for (const t of [...item.series, item.answer]) expect(t.dots).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('follows the level plan in the catalog', () => {
    const rand = seeded(3);
    const rulesAt = (level: number) => {
      const seen = new Set<RuleKind>();
      for (let k = 0; k < 80; k++) seen.add(generatePattern(level, 4, rand).rule);
      return seen;
    };
    expect([...rulesAt(1)]).toEqual(['repeat2']);
    expect([...rulesAt(3)].sort()).toEqual(['count', 'repeat3']);
    expect([...rulesAt(5)]).toEqual(['together']);
    expect([...rulesAt(7)].sort()).toEqual(['grow', 'interleave', 'mirror']);
    expect([...rulesAt(9)]).toEqual(['twoRules']);
  });

  it('gets harder with level: more changing attributes and near-miss distractors', () => {
    const rand = seeded(4);
    const avg = (level: number, f: (i: ReturnType<typeof generatePattern>) => number) => {
      let s = 0;
      for (let k = 0; k < 100; k++) s += f(generatePattern(level, 4, rand));
      return s / 100;
    };
    expect(avg(9, (i) => i.varying.length)).toBeGreaterThan(avg(2, (i) => i.varying.length));
    // At L9–10 distractors mostly keep all but one changing attribute equal to the answer.
    const sharesOne = (i: ReturnType<typeof generatePattern>) =>
      i.options.filter((o) => !sameTile(o, i.answer) && i.varying.filter((a) => o[a] === i.answer[a]).length === i.varying.length - 1).length;
    expect(avg(10, sharesOne)).toBeGreaterThanOrEqual(2);
  });

  it('predicts obvious continuations', () => {
    expect([...predictNext(['a', 'b', 'a', 'b'], 'shape')]).toEqual(['a']);
    expect([...predictNext([1, 2, 3, 4], 'dots')]).toEqual([5]);
    expect(predictNext([1, 8, 2, 8, 3, 8], 'dots').has(4)).toBe(true);
  });
});

describe('pattern options and why step', () => {
  it('uses 4 options for Keep Sharp and 2–3 for Rebuild', () => {
    for (const level of LEVELS) {
      expect(optionCount(level, 'keepSharp')).toBe(4);
      expect(optionCount(level, 'rebuild')).toBeGreaterThanOrEqual(2);
      expect(optionCount(level, 'rebuild')).toBeLessThanOrEqual(3);
    }
  });

  it('offers the right rule among distinct choices and has an example for every rule', () => {
    const rand = seeded(5);
    for (const rule of RULES) {
      const c = whyChoices(rule, 3, rand);
      expect(c).toContain(rule);
      expect(new Set(c).size).toBe(3);
      expect(ruleExample(rule, rand).length).toBeGreaterThanOrEqual(4);
    }
    expect(whyChoices('count', 3, rand)).not.toContain('grow');
  });

  it('steps up after two right and down after misses', () => {
    let s = { level: 3, up: 0, down: 0 };
    s = stepStair(s, true, 'keepSharp');
    expect(s.level).toBe(3);
    s = stepStair(s, true, 'keepSharp');
    expect(s.level).toBe(4);
    s = stepStair(s, false, 'keepSharp');
    expect(s.level).toBe(4);
    s = stepStair(s, false, 'keepSharp');
    expect(s.level).toBe(3);
    expect(stepStair({ level: 3, up: 1, down: 0 }, false, 'rebuild').level).toBe(2);
    expect(stepStair({ level: 1, up: 0, down: 0 }, false, 'rebuild').level).toBe(1);
    expect(stepStair({ level: 10, up: 1, down: 0 }, true, 'keepSharp').level).toBe(10);
  });
});
