import { describe, expect, it } from '@jest/globals';

import { CONCEPTS } from '@/content/concepts';
import { STORIES } from '@/content/stories';
import { LANGS } from '@/lib/lang';
import { nextDisplayMs, nextLevel } from '../adaptive';
import { addDays, daysBetween } from '../dates';
import { phaseFor } from '../program';
import { ANCHOR, GAMES, type GameId } from '@/games/catalog';
import { buildPlan } from '../session';
import { migrateState } from '@/state/migrations';
import { dueCards, endOfDay, newCard, reviewCard } from '../srs';

describe('dates', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(daysBetween('2026-10-01', '2026-10-08')).toBe(7);
  });
});

describe('srs (learn-sdk FSRS)', () => {
  const day = 86_400_000;
  const t0 = new Date(2026, 9, 7, 10).getTime();

  it('starts a new card due now and pushes it out after a correct recall', () => {
    const c0 = newCard('x', t0);
    expect(c0.card.due).toBe(t0);
    const c1 = reviewCard(c0, true, t0);
    expect(c1.card.due).toBeGreaterThan(t0 + day / 2);
    expect(c1.streak).toBe(1);
    expect(c1.reviews).toBe(1);
  });

  it('brings a card back sooner after a miss and resets the streak', () => {
    const good = reviewCard(reviewCard(newCard('x', t0), true, t0), true, t0 + 3 * day);
    const missed = reviewCard(good, false, good.card.due);
    const kept = reviewCard(good, true, good.card.due);
    expect(missed.card.due).toBeLessThan(kept.card.due);
    expect(missed.streak).toBe(0);
    expect(missed.lapses).toBe(1);
  });

  it('returns only due cards, longest overdue first', () => {
    const at = (id: string, due: number) => ({ ...newCard(id, t0), card: { ...newCard(id, t0).card, due } });
    const cards = { a: at('a', t0 + 2 * day), b: at('b', t0 + day), c: at('c', t0 + 20 * day) };
    expect(dueCards(cards, endOfDay('2026-10-10'), 5).map((c) => c.card.itemId)).toEqual(['b', 'a']);
    expect(dueCards(cards, endOfDay('2026-10-10'), 1)).toHaveLength(1);
  });

  it('migrates 0.1 progress to FSRS cards, keeping due days and counters', () => {
    const migrated = migrateState(
      { vaultReviews: { 'person:lina': { id: 'person:lina', stage: 3, due: '2026-10-09', reviews: 4, lapses: 1 } } },
      2,
      t0,
    );
    expect(migrated.vaultReviews).toBeUndefined();
    const card = (migrated.vaultCards as Record<string, ReturnType<typeof newCard>>)['person:lina'];
    expect(card.card.due).toBe(new Date(2026, 9, 9).getTime());
    expect(card).toMatchObject({ reviews: 4, lapses: 1, streak: 3 });
    // The migrated state is a real FSRS state the scheduler accepts.
    expect(reviewCard(card, true, card.card.due).card.due).toBeGreaterThan(card.card.due);
  });

  it('runs every migration from version 1', () => {
    const migrated = migrateState({ settings: {} }, 1, t0);
    expect(migrated).toMatchObject({ gameData: {}, recentGames: [], vaultCards: {} });
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
