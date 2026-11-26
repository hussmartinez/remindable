import type { Profile } from '@/engine/adaptive';
import { latinCandidates, range, shuffled, solve, type CageOp, type Csp, type Hint, type Rand } from './solver';

/**
 * Number Cages (KenKen-style): every row and column holds 1..n once, and the
 * numbers in each outlined group combine to its clue. Puzzles are accepted only
 * when the step-by-step deductions in `cagesDeduce` finish them, so the
 * solution is unique and no guessing is needed.
 */

export type Cage = { cells: number[]; op: CageOp; target: number };

export type CagesParams = {
  size: 3 | 4 | 5;
  /** Operations allowed for cages of two or more squares. */
  ops: CageOp[];
  maxCage: number;
  /** Chance a new cage is a single given square. */
  singleRate: number;
};

export type Cages = CagesParams & { cages: Cage[]; cageOf: number[]; solution: number[] };

const TABLE: CagesParams[] = [
  { size: 3, ops: ['+'], maxCage: 2, singleRate: 0.3 },
  { size: 3, ops: ['+'], maxCage: 3, singleRate: 0.2 },
  { size: 4, ops: ['+'], maxCage: 2, singleRate: 0.25 },
  { size: 4, ops: ['+'], maxCage: 3, singleRate: 0.15 },
  { size: 4, ops: ['+', '-'], maxCage: 3, singleRate: 0.15 },
  { size: 4, ops: ['+', '-'], maxCage: 3, singleRate: 0.1 },
  { size: 5, ops: ['+', '-'], maxCage: 3, singleRate: 0.12 },
  { size: 5, ops: ['+', '-', '×'], maxCage: 3, singleRate: 0.1 },
  { size: 5, ops: ['+', '-', '×'], maxCage: 4, singleRate: 0.08 },
  { size: 5, ops: ['+', '-', '×'], maxCage: 4, singleRate: 0.05 },
];

/** × stays a Keep Sharp challenge; Rebuild keeps smaller cages and more givens. */
export function cagesParams(level: number, profile: Profile): CagesParams {
  const p = TABLE[Math.min(9, Math.max(0, level - 1))];
  if (profile === 'keepSharp') return p;
  return { ...p, ops: p.ops.filter((o) => o !== '×'), maxCage: Math.min(p.maxCage, 3), singleRate: p.singleRate + 0.1 };
}

export function cageValue(op: CageOp, values: number[]): number {
  if (op === '+') return values.reduce((a, b) => a + b, 0);
  if (op === '×') return values.reduce((a, b) => a * b, 1);
  if (op === '-') return Math.abs(values[0] - values[1]);
  return values[0];
}

function neighbours(n: number, i: number): number[] {
  const r = Math.floor(i / n);
  const c = i % n;
  const out: number[] = [];
  if (r > 0) out.push(i - n);
  if (r < n - 1) out.push(i + n);
  if (c > 0) out.push(i - 1);
  if (c < n - 1) out.push(i + 1);
  return out;
}

function chooseOp(size: number, ops: CageOp[], rand: Rand): CageOp {
  if (size === 1) return '=';
  if (size === 2 && ops.includes('-') && rand() < 0.45) return '-';
  if (ops.includes('×') && rand() < 0.35) return '×';
  return '+';
}

function makeCage(cells: number[], op: CageOp, solution: number[]): Cage {
  return { cells, op, target: cageValue(op, cells.map((i) => solution[i])) };
}

function partition(p: CagesParams, solution: number[], rand: Rand): Cage[] {
  const n = p.size;
  const owner = new Array(n * n).fill(-1);
  const cages: Cage[] = [];
  for (const start of shuffled(range(n * n), rand)) {
    if (owner[start] !== -1) continue;
    const want = rand() < p.singleRate ? 1 : 2 + Math.floor(rand() * (p.maxCage - 1));
    const cells = [start];
    owner[start] = cages.length;
    while (cells.length < want) {
      const frontier = [...new Set(cells.flatMap((c) => neighbours(n, c)))].filter((j) => owner[j] === -1);
      if (!frontier.length) break;
      const next = frontier[Math.floor(rand() * frontier.length)];
      owner[next] = cages.length;
      cells.push(next);
    }
    cages.push(makeCage(cells, chooseOp(cells.length, p.ops, rand), solution));
  }
  return cages;
}

function indexCages(n: number, cages: Cage[]): number[] {
  const cageOf = new Array(n * n).fill(-1);
  cages.forEach((cg, k) => cg.cells.forEach((i) => (cageOf[i] = k)));
  return cageOf;
}

/** Pulls `cell` out into a one-square cage; the rest of its cage splits into connected parts. */
function splitOut(n: number, cages: Cage[], cell: number, solution: number[]): Cage[] {
  const out: Cage[] = [];
  for (const cg of cages) {
    if (!cg.cells.includes(cell)) {
      out.push(cg);
      continue;
    }
    out.push(makeCage([cell], '=', solution));
    const rest = new Set(cg.cells.filter((i) => i !== cell));
    while (rest.size) {
      const [seed] = rest;
      const part = [seed];
      rest.delete(seed);
      for (let k = 0; k < part.length; k++)
        for (const j of neighbours(n, part[k]))
          if (rest.has(j)) {
            rest.delete(j);
            part.push(j);
          }
      const op = part.length === 1 ? '=' : cg.op === '-' ? '+' : cg.op;
      out.push(makeCage(part, op, solution));
    }
  }
  return out;
}

/**
 * For each empty cell of `cage`, the values that appear in at least one way of
 * completing the cage that respects its clue and the visible rows and columns.
 */
function cageOptions(n: number, cage: Cage, grid: readonly number[]): Map<number, Set<number>> {
  const empty = cage.cells.filter((i) => grid[i] === 0);
  const opts = new Map(empty.map((i) => [i, new Set<number>()]));
  const cand = empty.map((i) => [...latinCandidates(grid, n, i)]);
  const vals = new Array(empty.length).fill(0);
  const known = cage.cells.filter((i) => grid[i] !== 0).map((i) => grid[i]);
  const clash = (a: number, b: number) => Math.floor(a / n) === Math.floor(b / n) || a % n === b % n;

  const rec = (k: number) => {
    if (k === empty.length) {
      if (cageValue(cage.op, cage.op === '-' ? orderForMinus(cage, grid, empty, vals) : [...known, ...vals]) === cage.target) {
        empty.forEach((i, j) => opts.get(i)!.add(vals[j]));
      }
      return;
    }
    for (const v of cand[k]) {
      if (empty.slice(0, k).some((other, j) => vals[j] === v && clash(other, empty[k]))) continue;
      vals[k] = v;
      rec(k + 1);
    }
  };
  rec(0);
  return opts;
}

function orderForMinus(cage: Cage, grid: readonly number[], empty: number[], vals: number[]): number[] {
  return cage.cells.map((i) => (grid[i] !== 0 ? grid[i] : vals[empty.indexOf(i)]));
}

/**
 * The easiest next deduction on `grid` that can be explained from what is
 * visible, easiest tier first. `prefer` (the selected square) wins within a tier.
 */
export function cagesDeduce(n: number, cages: Cage[], grid: readonly number[], prefer = -1): Hint | null {
  const tier = deduceTiers(n, cages, grid, true).find((t) => t.length);
  return tier ? (tier.find((h) => h.cell === prefer) ?? tier[0]) : null;
}

/** All deductions on `grid`, grouped easiest tier first; `firstOnly` stops at the first non-empty tier. */
function deduceTiers(n: number, cages: Cage[], grid: readonly number[], firstOnly: boolean): Hint[][] {
  const tiers: Hint[][] = [];
  const done = (hints: Hint[]) => {
    tiers.push(hints);
    return firstOnly && hints.length > 0;
  };
  const options = cages.map((cg) => cageOptions(n, cg, grid));

  const cageHints: Hint[] = [];
  cages.forEach((cg, k) => {
    const empty = cg.cells.filter((i) => grid[i] === 0);
    if (empty.length !== 1) return;
    const vals = [...options[k].get(empty[0])!];
    if (vals.length !== 1) return;
    cageHints.push({
      cell: empty[0],
      value: vals[0],
      reason: cg.op === '=' ? { kind: 'cageOne' } : { kind: 'cageLast', op: cg.op, target: cg.target },
    });
  });
  if (done(cageHints)) return tiers;

  const lines = [
    ...range(n).map((r) => ({ unit: 'row' as const, cells: range(n).map((c) => r * n + c) })),
    ...range(n).map((c) => ({ unit: 'col' as const, cells: range(n).map((r) => r * n + c) })),
  ];
  const last: Hint[] = [];
  for (const l of lines) {
    const empty = l.cells.filter((i) => grid[i] === 0);
    if (empty.length !== 1) continue;
    const seen = l.cells.map((i) => grid[i]).filter(Boolean).sort((a, b) => a - b);
    const value = range(n, 1).find((v) => !seen.includes(v))!;
    last.push({ cell: empty[0], value, reason: { kind: 'lastInUnit', unit: l.unit, seen } });
  }
  if (done(last)) return tiers;

  const naked: Hint[] = [];
  const fit: Hint[] = [];
  const possible = new Map<number, Set<number>>();
  cages.forEach((cg, k) => options[k].forEach((set, cell) => possible.set(cell, set)));
  for (let i = 0; i < n * n; i++) {
    if (grid[i] !== 0) continue;
    const latin = latinCandidates(grid, n, i);
    if (latin.size === 1) {
      const r = Math.floor(i / n);
      const c = i % n;
      const seen = [...new Set(range(n).flatMap((k) => [grid[r * n + k], grid[k * n + c]]).filter(Boolean))].sort((a, b) => a - b);
      naked.push({ cell: i, value: [...latin][0], reason: { kind: 'naked', seen, withBox: false } });
      continue;
    }
    const set = possible.get(i)!;
    if (set.size === 1) {
      const cg = cages.find((x) => x.cells.includes(i))!;
      fit.push({ cell: i, value: [...set][0], reason: { kind: 'cageFit', op: cg.op, target: cg.target } });
    }
  }
  if (done(naked) || done(fit)) return tiers;

  const hidden: Hint[] = [];
  for (const l of lines) {
    for (let v = 1; v <= n; v++) {
      if (l.cells.some((i) => grid[i] === v)) continue;
      const spots = l.cells.filter((i) => grid[i] === 0 && possible.get(i)!.has(v));
      if (spots.length === 1) hidden.push({ cell: spots[0], value: v, reason: { kind: 'hidden', unit: l.unit } });
    }
  }
  done(hidden);
  return tiers;
}

/** Runs the deductions; returns the grid reached (complete if solvable without guessing). */
export function cagesRun(n: number, cages: Cage[], start?: readonly number[]): number[] {
  const grid = start ? [...start] : new Array(n * n).fill(0);
  for (;;) {
    if (!grid.includes(0)) return grid;
    // Every deduction found is forced, so apply them all in one pass.
    const hints = deduceTiers(n, cages, grid, false).flat();
    if (!hints.length) return grid;
    for (const h of hints) grid[h.cell] = h.value;
  }
}

/** Backtracking check used by tests: cage clues are checked once a cage is full. */
export function cagesCsp(n: number, cages: Cage[]): Csp {
  const cageOf = indexCages(n, cages);
  return {
    cells: n * n,
    candidates: (grid, cell) =>
      [...latinCandidates(grid, n, cell)].filter((v) => {
        const cg = cages[cageOf[cell]];
        const vals = cg.cells.map((i) => (i === cell ? v : grid[i]));
        if (vals.includes(0)) return cg.op !== '+' || vals.reduce((a, b) => a + b, 0) < cg.target;
        return cageValue(cg.op, vals) === cg.target;
      }),
  };
}

export function generateCages(params: CagesParams, rand: Rand = Math.random): Cages {
  const n = params.size;
  let best: { cages: Cage[]; splits: number; solution: number[] } | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const solution = solve({ cells: n * n, candidates: (g, i) => [...latinCandidates(g, n, i)] }, new Array(n * n).fill(0), 1, rand).first!;
    let cages = partition(params, solution, rand);
    let splits = 0;
    let reached = new Array(n * n).fill(0);
    for (;;) {
      // Splitting only tightens clues, so earlier deductions stay valid and we resume.
      reached = cagesRun(n, cages, reached);
      const stuck = range(n * n).filter((i) => reached[i] === 0);
      if (!stuck.length) break;
      cages = splitOut(n, cages, stuck[Math.floor(rand() * stuck.length)], solution);
      splits++;
    }
    if (!best || splits < best.splits) best = { cages, splits, solution };
    if (splits <= 1) break;
  }
  return { ...params, cages: best!.cages, cageOf: indexCages(n, best!.cages), solution: best!.solution };
}
