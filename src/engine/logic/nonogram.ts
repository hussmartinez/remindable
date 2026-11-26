import type { Profile } from '@/engine/adaptive';
import { range, type Hint, type Rand } from './solver';

/**
 * Picture Grid (nonogram): numbers beside each row and above each column give
 * the runs of filled squares. The pictures are curated so a person can finish
 * them one line at a time; `lineSolve` proves that (no guessing, unique).
 */

export type Picture = { id: string; emoji: string; color: string; rows: string[] };

/** '#' = filled. Simple, familiar objects that read well as a few pixels. */
export const PICTURES: Picture[] = [
  { id: 'heart', emoji: '❤️', color: '#C2577A', rows: ['.#.#.', '#####', '#####', '.###.', '..#..'] },
  { id: 'house', emoji: '🏠', color: '#B5703A', rows: ['..#..', '.###.', '#####', '##.##', '##.##'] },
  { id: 'tree', emoji: '🌳', color: '#2E7D4F', rows: ['..#..', '.###.', '#####', '..#..', '..#..'] },
  { id: 'star', emoji: '⭐', color: '#D99A2B', rows: ['..#..', '#####', '.###.', '.#.#.', '#...#'] },
  { id: 'smile', emoji: '😊', color: '#D99A2B', rows: ['.###.', '#.#.#', '#####', '#...#', '.###.'] },
  { id: 'boat', emoji: '⛵', color: '#3A6FA8', rows: ['..#..', '..##.', '..###', '..#..', '#####'] },
  { id: 'bell', emoji: '🔔', color: '#D99A2B', rows: ['..#..', '.###.', '.###.', '#####', '..#..'] },
  { id: 'cup', emoji: '☕', color: '#8A5A3B', rows: ['####..', '######', '####.#', '######', '####..', '.##...'] },
  { id: 'fish', emoji: '🐟', color: '#3A6FA8', rows: ['......', '.###.#', '#.####', '######', '.###.#', '......'] },
  { id: 'heart', emoji: '❤️', color: '#C2577A', rows: ['##..##', '######', '######', '.####.', '..##..', '......'] },
  { id: 'mushroom', emoji: '🍄', color: '#B04A4A', rows: ['.####.', '######', '#.##.#', '######', '..##..', '..##..'] },
  { id: 'apple', emoji: '🍎', color: '#B04A4A', rows: ['...##.', '..#...', '.####.', '######', '######', '.####.'] },
  {
    id: 'key',
    emoji: '🔑',
    color: '#D99A2B',
    rows: ['........', '.###....', '##.##...', '#...####', '##.#####', '.###.#.#', '........', '........'],
  },
  {
    id: 'smile',
    emoji: '😊',
    color: '#D99A2B',
    rows: ['..####..', '.######.', '##.##.##', '########', '#.####.#', '##....##', '.######.', '..####..'],
  },
  {
    id: 'house',
    emoji: '🏠',
    color: '#B5703A',
    rows: ['...##...', '..####..', '.######.', '########', '.######.', '.##..##.', '.##..##.', '.##..##.'],
  },
  {
    id: 'cup',
    emoji: '☕',
    color: '#8A5A3B',
    rows: ['..#.#...', '.#.#....', '######..', '########', '######.#', '########', '.####...', '######..'],
  },
  {
    id: 'star',
    emoji: '⭐',
    color: '#D99A2B',
    rows: ['...##...', '...##...', '########', '.######.', '..####..', '.######.', '.##..##.', '##....##'],
  },
  {
    id: 'tree',
    emoji: '🌳',
    color: '#2E7D4F',
    rows: ['...##...', '..####..', '.######.', '..####..', '.######.', '########', '...##...', '...##...'],
  },
  {
    id: 'heart',
    emoji: '❤️',
    color: '#C2577A',
    rows: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
  },
];

export type PictureParams = { size: 5 | 6 | 8 };

export function pictureParams(level: number, profile: Profile): PictureParams {
  const [six, eight] = profile === 'keepSharp' ? [4, 7] : [5, 9];
  return { size: level >= eight ? 8 : level >= six ? 6 : 5 };
}

export type Nonogram = {
  size: number;
  picture: Picture;
  /** 1 = filled, 0 = empty, row-major. */
  solution: number[];
  rowClues: number[][];
  colClues: number[][];
};

export function runs(line: readonly number[]): number[] {
  const out: number[] = [];
  let k = 0;
  for (const v of line) {
    if (v === 1) k++;
    else if (k) {
      out.push(k);
      k = 0;
    }
  }
  if (k) out.push(k);
  return out;
}

export function toNonogram(picture: Picture): Nonogram {
  const size = picture.rows.length;
  const solution = picture.rows.flatMap((r) => [...r].map((ch) => (ch === '#' ? 1 : 0)));
  return {
    size,
    picture,
    solution,
    rowClues: range(size).map((r) => runs(solution.slice(r * size, r * size + size))),
    colClues: range(size).map((c) => runs(range(size).map((r) => solution[r * size + c]))),
  };
}

/**
 * Line solver. `known` uses -1 unknown, 0 empty, 1 filled. Returns the cells
 * that every arrangement of `clue` consistent with `known` agrees on, or null
 * if no arrangement fits (a contradiction).
 */
export function solveLine(clue: readonly number[], known: readonly number[]): number[] | null {
  const len = known.length;
  const canFill = new Array(len).fill(false);
  const canEmpty = new Array(len).fill(false);
  const line = new Array(len).fill(0);
  let any = false;

  const place = (b: number, from: number) => {
    if (b === clue.length) {
      for (let i = from; i < len; i++) if (known[i] === 1) return;
      any = true;
      for (let i = 0; i < len; i++) {
        if (i < from && line[i] === 1) canFill[i] = true;
        else canEmpty[i] = true;
      }
      return;
    }
    const size = clue[b];
    for (let s = from; s + size <= len; s++) {
      // Squares skipped before the block are empty, so a known filled one stops the slide.
      if (s > from && known[s - 1] === 1) break;
      let ok = s + size === len || known[s + size] !== 1;
      for (let i = s; ok && i < s + size; i++) if (known[i] === 0) ok = false;
      if (!ok) continue;
      for (let i = from; i < s; i++) line[i] = 0;
      for (let i = s; i < s + size; i++) line[i] = 1;
      if (s + size < len) line[s + size] = 0;
      place(b + 1, s + size + 1);
    }
  };
  place(0, 0);
  if (!any) return null;
  return range(len).map((i) => (canFill[i] && !canEmpty[i] ? 1 : canEmpty[i] && !canFill[i] ? 0 : -1));
}

type Line = { line: 'row' | 'col'; clue: number[]; cells: number[] };

function lines(p: Nonogram): Line[] {
  const n = p.size;
  return [
    ...range(n).map((r) => ({ line: 'row' as const, clue: p.rowClues[r], cells: range(n).map((c) => r * n + c) })),
    ...range(n).map((c) => ({ line: 'col' as const, clue: p.colClues[c], cells: range(n).map((r) => r * n + c) })),
  ];
}

const TIER = ['lineEmpty', 'lineFull', 'lineDone', 'lineOverlap', 'lineGap'] as const;

/**
 * Next line deduction on `known` (-1/0/1 per cell). Value in the hint is
 * 1 for filled, 0 for empty. Simplest explanation first; `prefer` wins ties.
 */
export function nonogramDeduce(p: Nonogram, known: readonly number[], prefer = -1): Hint | null {
  const found: Hint[] = [];
  for (const l of lines(p)) {
    const state = l.cells.map((i) => known[i]);
    const out = solveLine(l.clue, state);
    if (!out) continue;
    const total = l.clue.reduce((a, b) => a + b, 0);
    const exact = total + l.clue.length - 1 === p.size;
    const filled = state.filter((v) => v === 1).length;
    out.forEach((v, k) => {
      if (v === -1 || state[k] !== -1) return;
      const kind = !l.clue.length
        ? 'lineEmpty'
        : exact
          ? 'lineFull'
          : v === 0 && filled === total
            ? 'lineDone'
            : v === 1
              ? 'lineOverlap'
              : 'lineGap';
      found.push({ cell: l.cells[k], value: v, reason: { kind, line: l.line } });
    });
  }
  for (const kind of TIER) {
    const tier = found.filter((h) => h.reason.kind === kind);
    if (tier.length) return tier.find((h) => h.cell === prefer) ?? tier[0];
  }
  return null;
}

/** Repeats line deductions; true if they alone complete the picture. */
export function lineSolvable(p: Nonogram): boolean {
  const known = new Array(p.size * p.size).fill(-1);
  for (;;) {
    let changed = false;
    for (const l of lines(p)) {
      const out = solveLine(
        l.clue,
        l.cells.map((i) => known[i]),
      );
      if (!out) return false;
      out.forEach((v, k) => {
        if (v !== -1 && known[l.cells[k]] === -1) {
          known[l.cells[k]] = v;
          changed = true;
        }
      });
    }
    if (!known.includes(-1)) return known.every((v, i) => v === p.solution[i]);
    if (!changed) return false;
  }
}

export function generateNonogram(params: PictureParams, rand: Rand = Math.random, avoid?: string): Nonogram {
  const pool = PICTURES.filter((pic) => pic.rows.length === params.size && pic.id !== avoid);
  const pic = pool[Math.floor(rand() * pool.length)];
  return toNonogram(pic);
}
