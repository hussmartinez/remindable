import type { Profile } from '@/engine/adaptive';
import { cagesDeduce, cagesParams, generateCages, type Cages } from '@/engine/logic/cages';
import { generateNonogram, nonogramDeduce, pictureParams, type Nonogram } from '@/engine/logic/nonogram';
import type { CageOp, Hint } from '@/engine/logic/solver';
import { boxOf, generateSudoku, sudokuDeduce, sudokuParams, type Sudoku } from '@/engine/logic/sudoku';

/**
 * One shape for all three puzzle types, so a single screen handles selection,
 * checking and hints. Cell values: Sudoku/Cages hold 1..n (0 empty);
 * Picture Grid holds 1 filled, 2 marked empty, 0 untouched.
 */

export type Kind = 'sudoku' | 'cages' | 'picture';
export const KINDS: Kind[] = ['sudoku', 'cages', 'picture'];

export const FRUIT = ['🍎', '🍌', '🍇', '🍊', '🍐', '🍓'];

export type Puzzle =
  | { kind: 'sudoku'; n: number; data: Sudoku }
  | { kind: 'cages'; n: number; data: Cages }
  | { kind: 'picture'; n: number; data: Nonogram };

export function makePuzzle(kind: Kind, level: number, profile: Profile, avoidPicture?: string): Puzzle {
  if (kind === 'sudoku') {
    const data = generateSudoku(sudokuParams(level, profile));
    return { kind, n: data.size, data };
  }
  if (kind === 'cages') {
    const data = generateCages(cagesParams(level, profile));
    return { kind, n: data.size, data };
  }
  const data = generateNonogram(pictureParams(level, profile), Math.random, avoidPicture);
  return { kind, n: data.size, data };
}

export function solutionOf(p: Puzzle): number[] {
  return p.data.solution;
}

/** Squares the player cannot change. */
export function fixedCells(p: Puzzle): boolean[] {
  if (p.kind === 'sudoku') return p.data.puzzle.map((v) => v !== 0);
  return new Array(p.n * p.n).fill(false);
}

export function startGrid(p: Puzzle): number[] {
  return p.kind === 'sudoku' ? [...p.data.puzzle] : new Array(p.n * p.n).fill(0);
}

/** A placed value that contradicts the solution. Empty squares are never "wrong". */
export function isWrong(p: Puzzle, grid: readonly number[], i: number): boolean {
  const sol = solutionOf(p)[i];
  if (p.kind === 'picture') return (grid[i] === 1 && sol === 0) || (grid[i] === 2 && sol === 1);
  return grid[i] !== 0 && grid[i] !== sol;
}

export function isSolved(p: Puzzle, grid: readonly number[]): boolean {
  const sol = solutionOf(p);
  if (p.kind === 'picture') return sol.every((v, i) => (v === 1 ? grid[i] === 1 : grid[i] !== 1));
  return sol.every((v, i) => grid[i] === v);
}

export function isFull(p: Puzzle, grid: readonly number[]): boolean {
  if (p.kind === 'picture') return false;
  return !grid.includes(0);
}

/**
 * Next hint, deduced only from what is on the grid and correct (mistakes are
 * ignored), so the explanation is always true. Value is in grid encoding.
 */
export function nextHint(p: Puzzle, grid: readonly number[], prefer: number): Hint | null {
  const sol = solutionOf(p);
  if (p.kind === 'picture') {
    const known = grid.map((v, i) => (v === 1 && sol[i] === 1 ? 1 : v === 2 && sol[i] === 0 ? 0 : -1));
    const h = nonogramDeduce(p.data, known, prefer);
    return h && { ...h, value: h.value === 1 ? 1 : 2 };
  }
  const base = grid.map((v, i) => (v === sol[i] ? v : 0));
  if (p.kind === 'sudoku') return sudokuDeduce(p.n, base, p.data.technique, prefer);
  return cagesDeduce(p.n, p.data.cages, base, prefer);
}

export function symbol(p: Puzzle, v: number): string {
  if (v === 0) return '';
  if (p.kind === 'sudoku' && p.data.symbols === 'fruit') return FRUIT[v - 1];
  return String(v);
}

export const OP_LABEL: Record<CageOp, string> = { '+': '+', '-': '−', '×': '×', '=': '' };

export function cageClue(target: number, op: CageOp): string {
  return `${target}${OP_LABEL[op]}`;
}

/** Thick edges where a box or cage changes, so the grid structure reads at a glance. */
export function edges(p: Puzzle, i: number): { right: boolean; bottom: boolean } {
  const n = p.n;
  const r = Math.floor(i / n);
  const c = i % n;
  const group = (j: number) => (p.kind === 'sudoku' ? boxOf(n, j) : p.kind === 'cages' ? p.data.cageOf[j] : 0);
  return {
    right: c < n - 1 && group(i) !== group(i + 1),
    bottom: r < n - 1 && group(i) !== group(i + n),
  };
}

/** The clue drawn in the top-left square of each cage. */
export function cageLabel(p: Puzzle, i: number): string | null {
  if (p.kind !== 'cages') return null;
  const cg = p.data.cages[p.data.cageOf[i]];
  return Math.min(...cg.cells) === i ? cageClue(cg.target, cg.op) : null;
}
