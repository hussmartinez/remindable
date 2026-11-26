import { ANCHOR, GAMES, ROTATION, type Domain, type GameId } from '@/games/catalog';
import type { Profile } from './adaptive';

export type StepType = 'intro' | 'plant' | 'vault' | 'move' | 'vaultLater' | 'close' | GameId;

export type GameResult = { correct: number; total: number };

export type Plan = {
  steps: StepType[];
  /** Games played this session, for rotation history. */
  games: GameId[];
  /** Step where the intention emoji appears. */
  intentionStep: number;
  /** Step where a look-alike distractor appears (Keep Sharp only), or -1. */
  distractorStep: number;
};

export const SESSIONS_PER_WEEK = 5;

/**
 * Daily plan: a fixed anchor game per profile (speed training for Keep Sharp,
 * as in ACTIVE; naming for Rebuild) plus two rotating slots that cycle through
 * domain groups across the week. Day 1 of each week teaches a Memory Toolkit
 * strategy. `recent` is the list of games from previous sessions, newest first.
 */
export function buildPlan(profile: Profile, sessionNumber: number, recent: GameId[][] = []): Plan {
  const anchor = ANCHOR[profile];
  const day = sessionNumber % SESSIONS_PER_WEEK;
  const [cycle1, cycle2] = ROTATION[profile];

  const first = pickGame(cycle1[day], profile, [anchor], recent);
  const second = pickGame(cycle2[day], profile, [anchor, first], recent);

  const steps: StepType[] = ['intro', 'plant', 'vault', anchor, 'move', first, second, 'vaultLater', 'close'];
  const canHostIntention = (s: StepType) => {
    const meta = GAMES[s as GameId];
    return !!meta && !meta.timed && !meta.planning;
  };
  const intentionTarget = canHostIntention(first) ? first : canHostIntention(second) ? second : 'vaultLater';

  return {
    steps,
    games: [anchor, first, second],
    intentionStep: steps.indexOf(intentionTarget),
    // On the untimed Move step, so it never competes with a timed task.
    distractorStep: profile === 'keepSharp' ? steps.indexOf('move') : -1,
  };
}

function rotatable(profile: Profile, exclude: GameId[]) {
  return Object.values(GAMES).filter(
    (g) => !exclude.includes(g.id) && (!g.profiles || g.profiles.includes(profile)) && g.domain !== 'F',
  );
}

/**
 * Picks a game from `domain`, avoiding games played last session and
 * preferring the least recently played. Falls back to any domain if the
 * group has nothing available.
 */
export function pickGame(domain: Domain, profile: Profile, exclude: GameId[], recent: GameId[][]): GameId {
  if (domain === 'F' && !exclude.includes('toolkit')) return 'toolkit';
  const last = recent[0] ?? [];
  const all = rotatable(profile, exclude);
  const fresh = all.filter((g) => !last.includes(g.id));
  // Prefer the domain, then any game not played last session, then anything.
  const inDomain = fresh.filter((g) => g.domain === domain);
  const pool = inDomain.length ? inDomain : fresh.length ? fresh : all;

  const lastSeen = (id: GameId) => {
    const i = recent.findIndex((s) => s.includes(id));
    return i === -1 ? Infinity : i;
  };
  return [...pool].sort((a, b) => lastSeen(b.id) - lastSeen(a.id))[0].id;
}
