import type { Profile } from './adaptive';
import type { Rand } from './patterns';

/**
 * Light Path: Corsi-style visuospatial span plus a Mosaic pattern-copy mode.
 * The span task itself shows weak far transfer (Lampit 2014), so the value is
 * strategy practice: chunking the path into a shape, and errorless replays.
 */

/**
 * Nine tile positions (left, top) as fractions of the board width, with tiles 0.2 wide.
 * Irregular like the Corsi board so the path can't be read off a grid; fixed so it never flips in RTL.
 */
export const BOARD: [number, number][] = [
  [0.05, 0.08],
  [0.4, 0.03],
  [0.76, 0.1],
  [0.18, 0.36],
  [0.52, 0.3],
  [0.77, 0.47],
  [0.04, 0.66],
  [0.38, 0.6],
  [0.62, 0.82],
];
export const TILE = 0.2;
/** Board height as a fraction of its width. */
export const BOARD_HEIGHT = 1.05;
export const MOSAIC_SIDE = 4;

export type RoundMode = 'sequence' | 'mosaic';
export type MosaicView = 'visible' | 'brief' | 'delay';

export const MIN_SPAN = 2;
export const maxSpan = (profile: Profile) => (profile === 'rebuild' ? 4 : 7);
export const mosaicRange = (profile: Profile): [number, number] => (profile === 'rebuild' ? [3, 5] : [3, 8]);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lvl = (level: number) => clamp(Math.round(level), 1, 10);

/** Starting span: Keep Sharp climbs 2 → 7 over the ten levels, Rebuild stays within 2–4. */
export function spanFor(level: number, profile: Profile): number {
  const l = lvl(level);
  if (profile === 'rebuild') return l <= 3 ? 2 : l <= 7 ? 3 : 4;
  return clamp(2 + Math.floor((l - 1) * 5 / 9), MIN_SPAN, 7);
}

/** Backward recall only for Keep Sharp from level 6. */
export const backwardAllowed = (level: number, profile: Profile) => profile === 'keepSharp' && lvl(level) >= 6;

/** Lit time per tile: slow at first, standard later; Rebuild always slow. */
export function timing(level: number, profile: Profile): { onMs: number; gapMs: number } {
  const l = lvl(level);
  if (profile === 'rebuild') return { onMs: 1100, gapMs: 450 };
  return { onMs: l <= 3 ? 1000 : l <= 6 ? 850 : 700, gapMs: 350 };
}

export function mosaicCellsFor(level: number, profile: Profile): number {
  const l = lvl(level);
  if (profile === 'rebuild') return 3 + Math.floor((l - 1) / 4);
  return 3 + Math.floor((l - 1) * 5 / 9);
}

/** Mosaic goes from copying a visible model (Rebuild low levels), to a brief view, to recall after a delay (Keep Sharp). */
export function mosaicViewFor(level: number, profile: Profile): MosaicView {
  const l = lvl(level);
  if (profile === 'rebuild') return l <= 4 ? 'visible' : 'brief';
  return l >= 7 ? 'delay' : 'brief';
}

export function mosaicShowMs(level: number, profile: Profile): number {
  const l = lvl(level);
  if (profile === 'rebuild') return 5000;
  return l <= 3 ? 4000 : l <= 6 ? 3000 : 2500;
}

export const MOSAIC_DELAY_MS = 3000;

function shuffled(n: number, rand: Rand): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `span` distinct tiles in random order (no repeats, as on the Corsi board). */
export function makeSequence(span: number, rand: Rand = Math.random): number[] {
  return shuffled(BOARD.length, rand).slice(0, clamp(span, 1, BOARD.length));
}

/** Order the user must tap: as shown, or reversed for backward recall. */
export const expectedOrder = (seq: number[], backward: boolean) => (backward ? [...seq].reverse() : seq);

export type TapResult = 'next' | 'done' | 'wrong';

/** Checks one tap given how many correct taps came before it. */
export function checkTap(expected: number[], progress: number, tile: number): TapResult {
  if (expected[progress] !== tile) return 'wrong';
  return progress + 1 === expected.length ? 'done' : 'next';
}

/** `cells` distinct cells on a side×side grid, sorted. */
export function makeMosaic(cells: number, rand: Rand = Math.random, side = MOSAIC_SIDE): number[] {
  return shuffled(side * side, rand)
    .slice(0, clamp(cells, 1, side * side))
    .sort((a, b) => a - b);
}

/** Round plan: mostly sequence, with a Mosaic round every few. */
export const ROUNDS: RoundMode[] = ['sequence', 'sequence', 'mosaic', 'sequence', 'sequence', 'mosaic', 'sequence', 'mosaic'];

/** A strategy tip comes before every third round, starting with the second. */
export const tipBefore = (round: number) => round % 3 === 1;

export type TipKey = 'shape' | 'say' | 'picture' | 'backward';

/** Picture tip before Mosaic; otherwise the shape/chunking tip comes first (or the backward tip once reverse order starts). */
export function tipFor(round: number, mode: RoundMode, backward: boolean): TipKey {
  if (mode === 'mosaic') return 'picture';
  if (round <= 1) return backward ? 'backward' : 'shape';
  return backward ? 'shape' : 'say';
}
