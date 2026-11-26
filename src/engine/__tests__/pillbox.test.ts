import { describe, expect, it } from '@jest/globals';

import {
  cellKey,
  checkFill,
  expectedFill,
  makeQuestion,
  makeRound,
  pillConfig,
  sameSet,
  SLOTS,
  weekOrder,
  type Day,
  type Round,
  type Rule,
} from '../pillbox';

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);
const PROFILES = ['keepSharp', 'rebuild'] as const;

function rounds(n = 60): Round[] {
  const out: Round[] = [];
  for (const profile of PROFILES)
    for (const lv of LEVELS)
      for (const lang of ['en', 'ar'])
        for (let i = 0; i < n / 10; i++) out.push(makeRound(pillConfig(lv, profile), weekOrder(lang)));
  return out;
}

/** Independent reading of a rule: the days it applies on, then the times. */
function doses(rule: Rule, days: Day[]): Set<string> {
  const out = new Set<string>();
  days.forEach((d, pos) => {
    if (rule.days.kind === 'only' && !rule.days.days.includes(d)) return;
    if (rule.days.kind === 'everyOther' && pos % 2 !== 0) return;
    const after = rule.change ? pos >= days.indexOf(rule.change.from) : false;
    if (after && rule.change?.kind === 'stop') return;
    const slots = [...rule.slots];
    if (after && rule.change?.kind === 'add') slots.push(rule.change.slot);
    for (const s of slots) out.add(cellKey(d, s));
  });
  return out;
}

describe('pillbox config', () => {
  it('grows pills, days and memory load with level', () => {
    for (const profile of PROFILES) {
      for (let lv = 2; lv <= 10; lv++) {
        const a = pillConfig(lv - 1, profile);
        const b = pillConfig(lv, profile);
        expect(b.pills).toBeGreaterThanOrEqual(a.pills);
        expect(b.days).toBeGreaterThanOrEqual(a.days);
        expect(Number(b.hideCard)).toBeGreaterThanOrEqual(Number(a.hideCard));
      }
    }
    expect(pillConfig(1, 'keepSharp')).toMatchObject({ pills: 1, days: 1 });
    expect(pillConfig(10, 'keepSharp')).toMatchObject({ pills: 4, days: 7, tier: 'change', hideCard: true });
  });

  it('keeps Rebuild to one day, 1–2 pills, card visible and errorless', () => {
    for (const lv of LEVELS) {
      const c = pillConfig(lv, 'rebuild');
      expect(c.days).toBe(1);
      expect(c.pills).toBeLessThanOrEqual(2);
      expect(c.hideCard).toBe(false);
      expect(c.errorless).toBe(true);
    }
  });

  it('starts the week on Monday for es/en and Saturday for ar', () => {
    expect(weekOrder('es')[0]).toBe(0);
    expect(weekOrder('en')[0]).toBe(0);
    expect(weekOrder('ar')[0]).toBe(5);
    expect(new Set(weekOrder('ar')).size).toBe(7);
  });
});

describe('pillbox schedule', () => {
  it('fills exactly the compartments the rules ask for', () => {
    for (const r of rounds()) {
      const fill = expectedFill(r);
      for (const rule of r.rules) {
        const want = doses(rule, r.days);
        for (const d of r.days)
          for (const s of SLOTS) expect(fill[cellKey(d, s)].includes(rule.pill)).toBe(want.has(cellKey(d, s)));
      }
    }
  });

  it('gives every pill at least one dose and keeps pills distinct', () => {
    for (const r of rounds()) {
      const fill = Object.values(expectedFill(r)).flat();
      for (const p of r.pills) expect(fill).toContain(p.id);
      expect(new Set(r.pills.map((p) => p.color)).size).toBe(r.pills.length);
    }
  });

  it('uses only grid days in specific-day rules, and changes always matter', () => {
    for (const r of rounds()) {
      for (const rule of r.rules) {
        if (rule.days.kind === 'only') for (const d of rule.days.days) expect(r.days).toContain(d);
        if (rule.change) {
          expect(r.days.indexOf(rule.change.from)).toBeGreaterThan(0);
          const without = doses({ ...rule, change: undefined }, r.days);
          const withChange = doses(rule, r.days);
          expect(setEq(without, withChange)).toBe(false);
        }
      }
    }
  });

  it('introduces the level feature', () => {
    for (let i = 0; i < 30; i++) {
      const top = makeRound(pillConfig(10, 'keepSharp'));
      expect(top.rules.some((r) => r.change)).toBe(true);
      expect(top.days).toHaveLength(7);
      const other = makeRound(pillConfig(5, 'keepSharp'));
      expect(other.rules.some((r) => r.days.kind === 'everyOther')).toBe(true);
      const food = makeRound(pillConfig(6, 'keepSharp'));
      expect(food.rules.some((r) => r.withFood)).toBe(true);
    }
  });

  it('marks the right fill correct and a missing dose wrong', () => {
    for (const r of rounds(20)) {
      const fill = expectedFill(r);
      expect(Object.values(checkFill(r, fill)).every(Boolean)).toBe(true);
      const key = Object.keys(fill).find((k) => fill[k].length > 0)!;
      const broken = { ...fill, [key]: fill[key].slice(1) };
      expect(checkFill(r, broken)[fill[key][0]]).toBe(false);
    }
  });
});

describe('pillbox questions', () => {
  it('answers match the schedule and are always among unique options', () => {
    for (const r of rounds()) {
      const q = makeQuestion(r, 4);
      expect(sameSet(q.answer, expectedFill(r)[cellKey(q.day, q.slot)])).toBe(true);
      expect(q.options.filter((o) => sameSet(o, q.answer))).toHaveLength(1);
      const keys = q.options.map((o) => [...o].sort().join('+'));
      expect(new Set(keys).size).toBe(keys.length);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

function setEq(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((x) => b.has(x));
}
