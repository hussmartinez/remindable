/**
 * Shared pieces for the Logic Corner generators: a seedable RNG and a small
 * backtracking solver used only to *verify* uniqueness. Grids here are at most
 * 8×8, so plain backtracking with "fewest candidates first" is instant.
 *
 * The overall approach (build a full solution, then strip clues while a solver
 * confirms the answer stays unique, and grade by the deductions a person needs)
 * follows Simon Tatham's Portable Puzzle Collection. No code is ported from it.
 */

export type Rand = () => number;

/** Small, fast seedable PRNG (mulberry32) so tests and previews are reproducible. */
export function seeded(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(items: readonly T[], rand: Rand): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function range(n: number, from = 0): number[] {
  return Array.from({ length: n }, (_, i) => i + from);
}

/**
 * A constraint problem over grid cells. `grid[i] === 0` means empty.
 * `candidates` returns the values still allowed in an empty cell given the
 * partial grid; an empty list means a dead end.
 */
export type Csp = {
  cells: number;
  candidates: (grid: readonly number[], cell: number) => number[];
};

/**
 * Counts solutions up to `limit` (2 is enough to prove uniqueness) and returns
 * the first one found. With `rand`, candidate order is shuffled, which turns
 * the same routine into a random full-grid generator.
 */
export function solve(csp: Csp, start: readonly number[], limit = 2, rand?: Rand): { count: number; first: number[] | null } {
  const grid = [...start];
  let count = 0;
  let first: number[] | null = null;

  const step = (): boolean => {
    let best = -1;
    let bestVals: number[] = [];
    for (let i = 0; i < csp.cells; i++) {
      if (grid[i] !== 0) continue;
      const vals = csp.candidates(grid, i);
      if (vals.length === 0) return false;
      if (best === -1 || vals.length < bestVals.length) {
        best = i;
        bestVals = vals;
        if (vals.length === 1) break;
      }
    }
    if (best === -1) {
      count++;
      if (!first) first = [...grid];
      return count >= limit;
    }
    for (const v of rand ? shuffled(bestVals, rand) : bestVals) {
      grid[best] = v;
      if (step()) return true;
    }
    grid[best] = 0;
    return false;
  };

  step();
  return { count, first };
}

/** Values 1..n not yet used in the cell's row and column (Latin-square rule). */
export function latinCandidates(grid: readonly number[], n: number, cell: number): Set<number> {
  const r = Math.floor(cell / n);
  const c = cell % n;
  const free = new Set(range(n, 1));
  for (let k = 0; k < n; k++) {
    free.delete(grid[r * n + k]);
    free.delete(grid[k * n + c]);
  }
  return free;
}

export type Unit = 'row' | 'col' | 'box';

/**
 * Why a hinted cell holds its value, as data. The game turns it into one short
 * sentence, e.g. "This row already has 1, 2 and 4, so this must be 3".
 */
export type HintReason =
  /** The unit has every value but one. */
  | { kind: 'lastInUnit'; unit: Unit; seen: number[] }
  /** Row, column (and box) together rule out every other value. */
  | { kind: 'naked'; seen: number[]; withBox: boolean }
  /** The value fits nowhere else in this unit. */
  | { kind: 'hidden'; unit: Unit }
  /** A cage of one square states its own value. */
  | { kind: 'cageOne' }
  /** The last empty square of a cage must complete its total. */
  | { kind: 'cageLast'; op: CageOp; target: number }
  /** Only one value works with the cage total and the row/column. */
  | { kind: 'cageFit'; op: CageOp; target: number }
  /** Picture grid line deductions. */
  | { kind: 'lineEmpty'; line: 'row' | 'col' }
  | { kind: 'lineFull'; line: 'row' | 'col' }
  | { kind: 'lineDone'; line: 'row' | 'col' }
  | { kind: 'lineOverlap'; line: 'row' | 'col' }
  | { kind: 'lineGap'; line: 'row' | 'col' };

export type CageOp = '+' | '-' | '×' | '=';

export type Hint = { cell: number; value: number; reason: HintReason };
