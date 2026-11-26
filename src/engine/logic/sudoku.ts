import type { Profile } from '@/engine/adaptive';
import { range, shuffled, solve, type Csp, type Hint, type Rand, type Unit } from './solver';

/**
 * Mini Sudoku: 4×4 (2×2 boxes) and 6×6 (2×3 boxes). Difficulty comes from the
 * number of givens and from the deductions needed: "naked" puzzles fall to
 * "only one value is left for this square"; "singles" puzzles may also need
 * "this value fits nowhere else in the row". Neither ever needs guessing.
 */

export type Technique = 'naked' | 'singles';

export type SudokuParams = {
  size: 4 | 6;
  givens: number;
  technique: Technique;
  symbols: 'fruit' | 'digits';
};

export type Sudoku = SudokuParams & {
  boxRows: number;
  boxCols: number;
  /** Starting grid, row-major; 0 = empty. */
  puzzle: number[];
  solution: number[];
};

const TABLE: SudokuParams[] = [
  { size: 4, givens: 10, technique: 'naked', symbols: 'fruit' },
  { size: 4, givens: 8, technique: 'naked', symbols: 'fruit' },
  { size: 4, givens: 7, technique: 'singles', symbols: 'fruit' },
  { size: 4, givens: 6, technique: 'singles', symbols: 'digits' },
  { size: 6, givens: 24, technique: 'naked', symbols: 'fruit' },
  { size: 6, givens: 21, technique: 'naked', symbols: 'digits' },
  { size: 6, givens: 18, technique: 'singles', symbols: 'digits' },
  { size: 6, givens: 16, technique: 'singles', symbols: 'digits' },
  { size: 6, givens: 14, technique: 'singles', symbols: 'digits' },
  { size: 6, givens: 12, technique: 'singles', symbols: 'digits' },
];

/** Rebuild keeps to naked singles and a few extra givens (near-errorless). */
export function sudokuParams(level: number, profile: Profile): SudokuParams {
  const p = TABLE[Math.min(9, Math.max(0, level - 1))];
  if (profile === 'keepSharp') return p;
  return { ...p, technique: 'naked', givens: p.givens + (p.size === 4 ? 1 : 2) };
}

type Geometry = { n: number; boxRows: number; boxCols: number; units: { unit: Unit; cells: number[] }[]; peers: number[][] };

const geoCache = new Map<number, Geometry>();

function geometry(n: number): Geometry {
  const cached = geoCache.get(n);
  if (cached) return cached;
  const boxRows = 2;
  const boxCols = n / 2;
  const units: Geometry['units'] = [];
  for (let r = 0; r < n; r++) units.push({ unit: 'row', cells: range(n).map((c) => r * n + c) });
  for (let c = 0; c < n; c++) units.push({ unit: 'col', cells: range(n).map((r) => r * n + c) });
  for (let br = 0; br < n / boxRows; br++)
    for (let bc = 0; bc < n / boxCols; bc++) {
      const cells: number[] = [];
      for (let r = 0; r < boxRows; r++) for (let c = 0; c < boxCols; c++) cells.push((br * boxRows + r) * n + bc * boxCols + c);
      units.push({ unit: 'box', cells });
    }
  const peers = range(n * n).map((i) => {
    const s = new Set<number>();
    for (const u of units) if (u.cells.includes(i)) u.cells.forEach((j) => j !== i && s.add(j));
    return [...s];
  });
  const g = { n, boxRows, boxCols, units, peers };
  geoCache.set(n, g);
  return g;
}

/** Index of the box a cell belongs to, for drawing thick borders. */
export function boxOf(n: number, cell: number): number {
  const r = Math.floor(cell / n);
  const c = cell % n;
  return Math.floor(r / 2) * 2 + Math.floor(c / (n / 2));
}

function seenBy(g: Geometry, grid: readonly number[], cells: readonly number[]): number[] {
  return [...new Set(cells.map((j) => grid[j]).filter((v) => v !== 0))].sort((a, b) => a - b);
}

function candidates(g: Geometry, grid: readonly number[], cell: number): number[] {
  const used = new Set(g.peers[cell].map((j) => grid[j]));
  return range(g.n, 1).filter((v) => !used.has(v));
}

/**
 * The easiest next deduction on `grid`, as a hint. Tiers, easiest first:
 * a unit with one gap, a square with one value left, a value with one place.
 * Within a tier, `prefer` (the square the user selected) wins if it qualifies.
 */
export function sudokuDeduce(n: number, grid: readonly number[], technique: Technique, prefer = -1): Hint | null {
  const g = geometry(n);
  const pickFrom = (hints: Hint[]) => hints.find((h) => h.cell === prefer) ?? hints[0] ?? null;

  const last: Hint[] = [];
  for (const u of g.units) {
    const empty = u.cells.filter((i) => grid[i] === 0);
    if (empty.length !== 1) continue;
    const seen = seenBy(g, grid, u.cells);
    const value = range(n, 1).find((v) => !seen.includes(v));
    if (value) last.push({ cell: empty[0], value, reason: { kind: 'lastInUnit', unit: u.unit, seen } });
  }
  if (last.length) return pickFrom(last);

  const naked: Hint[] = [];
  for (let i = 0; i < n * n; i++) {
    if (grid[i] !== 0) continue;
    const c = candidates(g, grid, i);
    if (c.length === 1) {
      naked.push({ cell: i, value: c[0], reason: { kind: 'naked', seen: seenBy(g, grid, g.peers[i]), withBox: true } });
    }
  }
  if (naked.length) return pickFrom(naked);
  if (technique === 'naked') return null;

  const hidden: Hint[] = [];
  for (const u of g.units) {
    for (let v = 1; v <= n; v++) {
      if (u.cells.some((i) => grid[i] === v)) continue;
      const spots = u.cells.filter((i) => grid[i] === 0 && candidates(g, grid, i).includes(v));
      if (spots.length === 1) hidden.push({ cell: spots[0], value: v, reason: { kind: 'hidden', unit: u.unit } });
    }
  }
  return pickFrom(hidden);
}

/** True if the deductions allowed by `technique` alone fill the grid. */
export function solvesLogically(n: number, puzzle: readonly number[], technique: Technique): boolean {
  const grid = [...puzzle];
  for (;;) {
    if (!grid.includes(0)) return true;
    const h = sudokuDeduce(n, grid, technique);
    if (!h) return false;
    grid[h.cell] = h.value;
  }
}

export function sudokuCsp(n: number): Csp {
  const g = geometry(n);
  return { cells: n * n, candidates: (grid, cell) => candidates(g, grid, cell) };
}

export function generateSudoku(params: SudokuParams, rand: Rand = Math.random): Sudoku {
  const n = params.size;
  const g = geometry(n);
  let best: { puzzle: number[]; solution: number[] } | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const solution = solve(sudokuCsp(n), new Array(n * n).fill(0), 1, rand).first!;
    const puzzle = [...solution];
    let givens = n * n;
    const order = shuffled(range(n * n), rand);
    for (const i of order) {
      if (givens <= params.givens) break;
      puzzle[i] = 0;
      // Logical solvability implies a unique solution, since every step is forced.
      if (solvesLogically(n, puzzle, params.technique)) givens--;
      else puzzle[i] = solution[i];
    }
    if (!best || givens < best.puzzle.filter(Boolean).length) best = { puzzle, solution };
    if (givens <= params.givens) break;
  }
  return { ...params, boxRows: g.boxRows, boxCols: g.boxCols, ...best! };
}
