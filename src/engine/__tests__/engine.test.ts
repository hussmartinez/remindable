import { describe, expect, it } from '@jest/globals';

import { CONCEPTS } from '@/content/concepts';
import { STORIES } from '@/content/stories';
import { LANGS } from '@/lib/lang';
import { nextDisplayMs, nextLevel } from '../adaptive';
import { addDays, daysBetween } from '../dates';
import { phaseFor } from '../program';
import { ANCHOR, GAMES, type GameId } from '@/games/catalog';
import { buildPlan } from '../session';
import { dueItems, INTERVALS, newReviewState, review } from '../srs';

describe('dates', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(daysBetween('2026-10-01', '2026-10-08')).toBe(7);
  });
});

describe('srs', () => {
  it('expands the interval on success and shrinks it on a lapse', () => {
    const s0 = newReviewState('x', '2026-10-07');
    expect(s0.due).toBe('2026-10-08');
    const s1 = review(s0, true, '2026-10-08');
    expect(s1.stage).toBe(1);
    expect(s1.due).toBe(addDays('2026-10-08', INTERVALS[1]));
    const s2 = review({ ...s1, stage: 4 }, false, '2026-10-10');
    expect(s2.stage).toBe(2);
    expect(s2.lapses).toBe(1);
  });

  it('returns only due items, oldest first', () => {
    const states = {
      a: { ...newReviewState('a', '2026-10-01'), due: '2026-10-05' },
      b: { ...newReviewState('b', '2026-10-01'), due: '2026-10-03' },
      c: { ...newReviewState('c', '2026-10-01'), due: '2026-10-20' },
    };
    expect(dueItems(states, '2026-10-07', 5).map((s) => s.id)).toEqual(['b', 'a']);
  });
});

describe('adaptive', () => {
  it('raises level on high success and lowers it on low success', () => {
    expect(nextLevel(3, 10, 10, 'keepSharp')).toBe(4);
    expect(nextLevel(3, 3, 10, 'keepSharp')).toBe(2);
    expect(nextLevel(3, 8, 10, 'keepSharp')).toBe(3);
    expect(nextLevel(1, 0, 5, 'rebuild')).toBe(1);
  });

  it('keeps display time within bounds', () => {
    expect(nextDisplayMs(61, true, 'keepSharp')).toBe(60);
    expect(nextDisplayMs(1900, false, 'rebuild')).toBe(2000);
    expect(nextDisplayMs(500, true, 'keepSharp')).toBeLessThan(500);
  });
});

describe('program phases', () => {
  it('follows core → maintenance → booster', () => {
    expect(phaseFor('2026-01-01', '2026-01-01')).toEqual({ kind: 'core', week: 1, weeks: 6 });
    expect(phaseFor('2026-01-01', addDays('2026-01-01', 100))).toEqual({ kind: 'maintenance' });
    expect(phaseFor('2026-01-01', addDays('2026-01-01', 335)).kind).toBe('booster');
  });
});

describe('session plan', () => {
  it('always includes the anchor game and never puts the intention on timed or planning games', () => {
    for (const profile of ['keepSharp', 'rebuild'] as const) {
      const recent: GameId[][] = [];
      for (let n = 0; n < 15; n++) {
        const p = buildPlan(profile, n, recent);
        expect(p.steps).toContain(ANCHOR[profile]);
        expect(new Set(p.games).size).toBe(3);
        const host = p.steps[p.intentionStep] as GameId;
        if (GAMES[host]) {
          expect(GAMES[host].timed).toBeFalsy();
          expect(GAMES[host].planning).toBeFalsy();
        }
        expect(p.intentionStep).toBeGreaterThan(p.steps.indexOf('plant'));
        // Rotating games don't repeat from the previous session.
        if (recent[0]) for (const g of p.games.slice(1)) expect(recent[0].slice(1)).not.toContain(g);
        recent.unshift(p.games);
      }
    }
  });

  it('varies games when practising again on the same day', () => {
    const first = buildPlan('keepSharp', 1, []);
    const again = buildPlan('keepSharp', 1, [first.games]);
    for (const g of again.games.slice(1)) expect(first.games).not.toContain(g);
  });

  it('teaches a Memory Toolkit lesson on day 1 of each week', () => {
    expect(buildPlan('keepSharp', 0).games).toContain('toolkit');
    expect(buildPlan('rebuild', 5).games).toContain('toolkit');
    expect(buildPlan('rebuild', 1).games).not.toContain('toolkit');
  });

  it('covers every domain group within a week', () => {
    for (const profile of ['keepSharp', 'rebuild'] as const) {
      const recent: GameId[][] = [];
      const domains = new Set<string>();
      for (let n = 0; n < 5; n++) {
        const p = buildPlan(profile, n, recent);
        p.games.forEach((g) => domains.add(GAMES[g].domain));
        recent.unshift(p.games);
      }
      for (const d of ['A', 'B', 'C', 'D', 'E', 'F']) expect(domains).toContain(d);
    }
  });
});

describe('content', () => {
  it('has every concept and story fully translated', () => {
    for (const c of CONCEPTS) {
      for (const l of LANGS) {
        expect(c.word[l]).toBeTruthy();
        expect(c.feature[l]).toBeTruthy();
        expect(c.place[l]).toBeTruthy();
      }
    }
    for (const s of STORIES) {
      for (const l of LANGS) {
        expect(s.topic[l]).toBeTruthy();
        s.lines.forEach((line) => expect(line.text[l]).toBeTruthy());
        s.events.forEach((e) => expect(e[l]).toBeTruthy());
      }
    }
  });

  it('has unique concept ids', () => {
    const ids = CONCEPTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
