import { describe, expect, it } from '@jest/globals';

import { cagesCsp, cagesDeduce, cagesParams, cagesRun, cageValue, generateCages } from '../logic/cages';
import { generateNonogram, lineSolvable, nonogramDeduce, PICTURES, pictureParams, solveLine, toNonogram } from '../logic/nonogram';
import { range, seeded, solve } from '../logic/solver';
import { generateSudoku, solvesLogically, sudokuCsp, sudokuDeduce, sudokuParams } from '../logic/sudoku';

const LEVELS = range(10, 1);
const PROFILES = ['keepSharp', 'rebuild'] as const;

function timed<T>(fn: () => T): { value: T; ms: number } {
  const t = Date.now();
  const value = fn();
  return { value, ms: Date.now() - t };
}

describe('mini sudoku', () => {
  it('is unique, solvable with the allowed deductions, and agrees with its solution', () => {
    for (const profile of PROFILES)
      for (const level of LEVELS)
        for (let seed = 1; seed <= 4; seed++) {
          const p = generateSudoku(sudokuParams(level, profile), seeded(seed * 100 + level));
          const n = p.size;
          const { count, first } = solve(sudokuCsp(n), p.puzzle, 2);
          expect(count).toBe(1);
          expect(first).toEqual(p.solution);
          expect(solvesLogically(n, p.puzzle, p.technique)).toBe(true);
          p.puzzle.forEach((v, i) => v && expect(v).toBe(p.solution[i]));
        }
  });

  it('Rebuild puzzles fall to "one value left" alone', () => {
    for (const level of LEVELS) {
      const p = generateSudoku(sudokuParams(level, 'rebuild'), seeded(level));
      expect(p.technique).toBe('naked');
      expect(solvesLogically(p.size, p.puzzle, 'naked')).toBe(true);
    }
  });

  it('gets harder with level: bigger grid, fewer givens, harder deductions, digits', () => {
    for (const profile of PROFILES)
      for (const level of LEVELS.slice(1)) {
        const a = sudokuParams(level - 1, profile);
        const b = sudokuParams(level, profile);
        expect(b.size).toBeGreaterThanOrEqual(a.size);
        if (a.size === b.size) expect(b.givens).toBeLessThan(a.givens);
        if (a.size === b.size && a.technique === 'singles') expect(b.technique).toBe('singles');
        if (a.symbols === 'digits' && a.size === b.size) expect(b.symbols).toBe('digits');
      }
    expect(sudokuParams(1, 'keepSharp')).toMatchObject({ size: 4, symbols: 'fruit' });
    expect(sudokuParams(10, 'keepSharp')).toMatchObject({ size: 6, symbols: 'digits' });
  });

  it('hints are always correct and explainable', () => {
    const p = generateSudoku(sudokuParams(8, 'keepSharp'), seeded(7));
    const grid = [...p.puzzle];
    while (grid.includes(0)) {
      const h = sudokuDeduce(p.size, grid, p.technique)!;
      expect(h).not.toBeNull();
      expect(h.value).toBe(p.solution[h.cell]);
      if (h.reason.kind === 'lastInUnit') expect(h.reason.seen).toHaveLength(p.size - 1);
      grid[h.cell] = h.value;
    }
  });

  it('prefers the selected square for a hint when it can be deduced', () => {
    const p = generateSudoku(sudokuParams(1, 'keepSharp'), seeded(3));
    const any = sudokuDeduce(4, p.puzzle, 'naked')!;
    expect(sudokuDeduce(4, p.puzzle, 'naked', any.cell)!.cell).toBe(any.cell);
  });
});

describe('number cages', () => {
  it('is unique and solvable without guessing at every level', () => {
    for (const profile of PROFILES)
      for (const level of LEVELS)
        for (let seed = 1; seed <= 4; seed++) {
          const p = generateCages(cagesParams(level, profile), seeded(seed * 31 + level));
          const n = p.size;
          expect(cagesRun(n, p.cages)).toEqual(p.solution);
          const { count, first } = solve(cagesCsp(n, p.cages), new Array(n * n).fill(0), 2);
          expect(count).toBe(1);
          expect(first).toEqual(p.solution);
          for (const cg of p.cages) {
            expect(cageValue(cg.op, cg.cells.map((i) => p.solution[i]))).toBe(cg.target);
            if (cg.op === '=') expect(cg.cells).toHaveLength(1);
            if (cg.op === '-') expect(cg.cells).toHaveLength(2);
            if (cg.op !== '=') expect(p.ops).toContain(cg.op);
          }
          expect(p.cageOf.every((k) => k >= 0)).toBe(true);
        }
  });

  it('only Keep Sharp top levels use ×, and difficulty grows with level', () => {
    for (const profile of PROFILES)
      for (const level of LEVELS.slice(1)) {
        const a = cagesParams(level - 1, profile);
        const b = cagesParams(level, profile);
        expect(b.size).toBeGreaterThanOrEqual(a.size);
        expect(b.ops.length).toBeGreaterThanOrEqual(a.ops.length);
        if (a.size === b.size) expect(b.maxCage).toBeGreaterThanOrEqual(a.maxCage);
        if (a.size === b.size) expect(b.singleRate).toBeLessThanOrEqual(a.singleRate);
      }
    expect(cagesParams(1, 'keepSharp').ops).toEqual(['+']);
    expect(cagesParams(10, 'keepSharp').ops).toContain('×');
    expect(LEVELS.some((l) => cagesParams(l, 'rebuild').ops.includes('×'))).toBe(false);
  });

  it('hints match the solution', () => {
    const p = generateCages(cagesParams(9, 'keepSharp'), seeded(11));
    const grid = new Array(p.size * p.size).fill(0);
    while (grid.includes(0)) {
      const h = cagesDeduce(p.size, p.cages, grid)!;
      expect(h.value).toBe(p.solution[h.cell]);
      grid[h.cell] = h.value;
    }
  });
});

describe('picture grid', () => {
  it('every curated picture is line-solvable (no guessing, unique)', () => {
    for (const pic of PICTURES) {
      expect(pic.rows.every((r) => r.length === pic.rows.length)).toBe(true);
      expect({ id: pic.id, size: pic.rows.length, ok: lineSolvable(toNonogram(pic)) }).toMatchObject({ ok: true });
    }
  });

  it('has several pictures at each size', () => {
    for (const size of [5, 6, 8]) expect(PICTURES.filter((p) => p.rows.length === size).length).toBeGreaterThanOrEqual(4);
  });

  it('line solver finds overlaps and contradictions', () => {
    expect(solveLine([4], [-1, -1, -1, -1, -1])).toEqual([-1, 1, 1, 1, -1]);
    expect(solveLine([1, 1], [-1, -1, -1])).toEqual([1, 0, 1]);
    expect(solveLine([], [-1, 1])).toBeNull();
    expect(solveLine([2], [1, -1, -1, -1])).toEqual([1, 1, 0, 0]);
  });

  it('grows with level', () => {
    for (const profile of PROFILES)
      for (const level of LEVELS.slice(1))
        expect(pictureParams(level, profile).size).toBeGreaterThanOrEqual(pictureParams(level - 1, profile).size);
    expect(pictureParams(1, 'keepSharp').size).toBe(5);
    expect(pictureParams(10, 'keepSharp').size).toBe(8);
  });

  it('hints walk to the full picture', () => {
    for (const size of [5, 6, 8] as const) {
      const p = generateNonogram({ size }, seeded(size));
      const known = new Array(size * size).fill(-1);
      while (known.includes(-1)) {
        const h = nonogramDeduce(p, known)!;
        expect(h.value).toBe(p.solution[h.cell]);
        known[h.cell] = h.value;
      }
    }
  });
});

describe('speed', () => {
  it('generates puzzles fast enough for a phone (<100 ms)', () => {
    // Warm up the JIT, then time every level and profile.
    generateCages(cagesParams(10, 'keepSharp'), seeded(0));
    const times: number[] = [];
    for (const profile of PROFILES)
      for (const level of LEVELS)
        for (let seed = 1; seed <= 10; seed++) {
          times.push(timed(() => generateSudoku(sudokuParams(level, profile), seeded(seed))).ms);
          times.push(timed(() => generateCages(cagesParams(level, profile), seeded(seed))).ms);
          times.push(timed(() => generateNonogram(pictureParams(level, profile), seeded(seed))).ms);
        }
    // A desktop runs this ~5× faster than a mid-range phone; the worst case also allows for GC pauses.
    expect(times.reduce((a, b) => a + b, 0) / times.length).toBeLessThan(5);
    // p95 rather than max: a single GC pause or parallel test worker shouldn't fail the suite.
    const p95 = [...times].sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
    expect(p95).toBeLessThan(60);
  });
});
