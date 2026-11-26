import type { Profile } from '@/engine/adaptive';

/**
 * Game metadata used by the session planner. Kept free of React so the
 * engine and its tests can import it; components live in `registry.tsx`.
 */

export type GameId =
  | 'wordGarden'
  | 'quickEye'
  | 'story'
  | 'patternPath'
  | 'lightPath'
  | 'pillBox'
  | 'stepByStep'
  | 'oddOneOut'
  | 'toolkit'
  | 'logic';

/**
 * Domain groups for rotation (docs/EXERCISE-CATALOG.md §3.2):
 * A speed/attention, B memory, C reasoning/executive, D language,
 * E everyday life, F strategy.
 */
export type Domain = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type GameMeta = {
  id: GameId;
  icon: string;
  domain: Domain;
  /** Has time pressure; the intention emoji must never appear on it. */
  timed?: boolean;
  /** Needs planning focus; the intention emoji must not interrupt it either. */
  planning?: boolean;
  /** Profiles it can rotate into. Defaults to both. */
  profiles?: Profile[];
};

export const GAMES: Record<GameId, GameMeta> = {
  quickEye: { id: 'quickEye', icon: '👁️', domain: 'A', timed: true },
  lightPath: { id: 'lightPath', icon: '💡', domain: 'B' },
  patternPath: { id: 'patternPath', icon: '🔷', domain: 'C' },
  logic: { id: 'logic', icon: '🧩', domain: 'C', planning: true },
  wordGarden: { id: 'wordGarden', icon: '🌷', domain: 'D' },
  story: { id: 'story', icon: '💬', domain: 'D' },
  oddOneOut: { id: 'oddOneOut', icon: '🔍', domain: 'D' },
  pillBox: { id: 'pillBox', icon: '💊', domain: 'E', planning: true },
  stepByStep: { id: 'stepByStep', icon: '👣', domain: 'E' },
  toolkit: { id: 'toolkit', icon: '🧰', domain: 'F' },
};

export const ANCHOR: Record<Profile, GameId> = {
  keepSharp: 'quickEye',
  rebuild: 'wordGarden',
};

/** Weekly domain cycles for the two rotating slots (EXERCISE-CATALOG §3.3). */
export const ROTATION: Record<Profile, [Domain[], Domain[]]> = {
  keepSharp: [
    ['C', 'E', 'D', 'C', 'B'],
    ['F', 'B', 'A', 'D', 'E'],
  ],
  rebuild: [
    ['E', 'D', 'E', 'B', 'D'],
    ['F', 'C', 'A', 'C', 'E'],
  ],
};
