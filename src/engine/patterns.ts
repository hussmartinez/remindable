import type { Profile } from './adaptive';

/**
 * Pattern Path generator: series completion as trained in the ACTIVE
 * reasoning arm (Willis et al.). Every item is built from one small rule per
 * attribute, then checked against a family of "obvious" rules so the series
 * has exactly one sensible continuation and no distractor also fits.
 */

export type Rand = () => number;

export const SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const;
export const COLORS = ['blue', 'orange', 'green', 'purple'] as const;
/** 0 small, 1 medium, 2 large. */
export const SIZES = [0, 1, 2] as const;
export const MAX_DOTS = 9;
/** Everyday objects, all Unicode ≤ 6 so they render on older Android. */
export const EMOJI = {
  apple: '🍎',
  flower: '🌻',
  fish: '🐟',
  star: '⭐',
  key: '🔑',
  balloon: '🎈',
  turtle: '🐢',
  ball: '⚽',
  lemon: '🍋',
  bike: '🚲',
} as const;

export type Shape = (typeof SHAPES)[number];
export type ColorKey = (typeof COLORS)[number];
export type EmojiKey = keyof typeof EMOJI;
export type TileKind = 'shape' | 'dots' | 'emoji';
export type Attr = 'shape' | 'color' | 'size' | 'dots' | 'emoji';
export type Tile = { shape: Shape; color: ColorKey; size: number; dots: number; emoji: EmojiKey | '' };

export type RuleKind = 'repeat2' | 'repeat3' | 'count' | 'together' | 'grow' | 'interleave' | 'mirror' | 'twoRules';
export const RULES: RuleKind[] = ['repeat2', 'repeat3', 'count', 'together', 'grow', 'interleave', 'mirror', 'twoRules'];

type Value = string | number;
/** How one attribute changes along the series. */
export type Seq =
  | { type: 'cycle'; values: Value[] }
  | { type: 'step'; start: number; delta: number }
  | { type: 'interleave'; even: Seq; odd: Seq };

export type PatternItem = {
  kind: TileKind;
  rule: RuleKind;
  /** Attributes that change along the series. */
  varying: Attr[];
  series: Tile[];
  answer: Tile;
  /** Shuffled; contains `answer` exactly once. */
  options: Tile[];
};

/** Attributes that are actually drawn for each tile kind; the rest are fixed so equal-looking tiles are equal. */
export const RENDERED: Record<TileKind, Attr[]> = {
  shape: ['shape', 'color', 'size'],
  dots: ['dots', 'color'],
  emoji: ['emoji', 'size'],
};

const NUMERIC: Attr[] = ['size', 'dots'];
const EMOJI_KEYS = Object.keys(EMOJI) as EmojiKey[];

function domain(attr: Attr): Value[] {
  switch (attr) {
    case 'shape':
      return [...SHAPES];
    case 'color':
      return [...COLORS];
    case 'size':
      return [...SIZES];
    case 'dots':
      return Array.from({ length: MAX_DOTS }, (_, i) => i + 1);
    case 'emoji':
      return EMOJI_KEYS;
  }
}

// ---------- small random helpers (injectable for tests) ----------

const pickR = <T>(items: readonly T[], rand: Rand): T => items[Math.floor(rand() * items.length)];

function shuffleR<T>(items: readonly T[], rand: Rand): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const distinct = <T>(items: readonly T[], n: number, rand: Rand): T[] => shuffleR(items, rand).slice(0, n);
const intIn = (lo: number, hi: number, rand: Rand) => lo + Math.floor(rand() * (hi - lo + 1));

// ---------- series construction ----------

export function valueAt(seq: Seq, i: number): Value {
  switch (seq.type) {
    case 'cycle':
      return seq.values[i % seq.values.length];
    case 'step':
      return seq.start + seq.delta * i;
    case 'interleave':
      return i % 2 === 0 ? valueAt(seq.even, i / 2) : valueAt(seq.odd, (i - 1) / 2);
  }
}

type Spec = { kind: TileKind; rule: RuleKind; base: Tile; attrs: Partial<Record<Attr, Seq>>; length: number };

function baseTile(kind: TileKind, rand: Rand): Tile {
  if (kind === 'dots') return { shape: 'square', color: pickR(COLORS, rand), size: 1, dots: 1, emoji: '' };
  if (kind === 'emoji') return { shape: 'circle', color: 'blue', size: 2, dots: 0, emoji: pickR(EMOJI_KEYS, rand) };
  return { shape: pickR(SHAPES, rand), color: pickR(COLORS, rand), size: 2, dots: 0, emoji: '' };
}

function tileAt(spec: Spec, i: number): Tile {
  const t = { ...spec.base } as Record<Attr, Value>;
  for (const [attr, seq] of Object.entries(spec.attrs) as [Attr, Seq][]) t[attr] = valueAt(seq, i);
  return t as unknown as Tile;
}

export const sameTile = (a: Tile, b: Tile) =>
  a.shape === b.shape && a.color === b.color && a.size === b.size && a.dots === b.dots && a.emoji === b.emoji;

const cycle = (values: Value[]): Seq => ({ type: 'cycle', values });
/** Size cycles use small vs large when only two sizes are needed, so they are easy to tell apart. */
const sizeValues = (n: number, rand: Rand): Value[] => (n === 2 ? shuffleR([0, 2], rand) : shuffleR([0, 1, 2], rand));
const valuesFor = (attr: Attr, n: number, rand: Rand) => (attr === 'size' ? sizeValues(n, rand) : distinct(domain(attr), n, rand));

/** Picks a tile kind able to show `attr`. */
const kindFor = (attr: Attr): TileKind => (attr === 'emoji' ? 'emoji' : attr === 'dots' ? 'dots' : 'shape');

function singleCycle(rule: RuleKind, attrs: Attr[], period: number, length: number, rand: Rand): Spec {
  const attr = pickR(attrs, rand);
  const kind = kindFor(attr);
  return { kind, rule, base: baseTile(kind, rand), attrs: { [attr]: cycle(valuesFor(attr, period, rand)) }, length };
}

function dotsStep(rule: RuleKind, start: number, delta: number, length: number, rand: Rand): Spec {
  return { kind: 'dots', rule, base: baseTile('dots', rand), attrs: { dots: { type: 'step', start, delta } }, length };
}

/** Level → rule family, following EXERCISE-CATALOG §2.1. */
function specFor(level: number, rand: Rand): Spec {
  if (level <= 2) {
    const attrs: Attr[] = level === 1 ? ['shape', 'color', 'emoji'] : ['shape', 'color', 'emoji', 'size'];
    return singleCycle('repeat2', attrs, 2, level === 1 ? 6 : 5, rand);
  }
  if (level <= 4) {
    if (rand() < 0.5) return singleCycle('repeat3', ['shape', 'color', 'emoji', 'size'], 3, pickR([6, 7], rand), rand);
    return dotsStep('count', intIn(1, level === 3 ? 3 : 4, rand), 1, 4, rand);
  }
  if (level <= 6) {
    const pair = pickR<Attr[]>([['color', 'size'], ['shape', 'color'], ['shape', 'size']], rand);
    const period = level === 5 ? 2 : pickR([2, 3], rand);
    const attrs = Object.fromEntries(pair.map((a) => [a, cycle(valuesFor(a, period, rand))]));
    return { kind: 'shape', rule: 'together', base: baseTile('shape', rand), attrs, length: period * 2 + intIn(0, 1, rand) };
  }
  if (level <= 8) {
    const rule = pickR<RuleKind>(['grow', 'interleave', 'mirror'], rand);
    if (rule === 'grow') {
      // Visible length 4 keeps every value, and the answer, within 1..9.
      const [start, delta] = pickR<[number, number]>([[1, 2], [9, -2], [intIn(6, 9, rand), -1]], rand);
      return dotsStep('grow', start, delta, 4, rand);
    }
    if (rule === 'interleave') {
      const start = intIn(1, 3, rand);
      const odd: Seq = level === 8 && rand() < 0.5 ? { type: 'step', start: 9, delta: -1 } : { type: 'step', start: intIn(7, 9, rand), delta: 0 };
      return {
        kind: 'dots',
        rule,
        base: baseTile('dots', rand),
        attrs: { dots: { type: 'interleave', even: { type: 'step', start, delta: 1 }, odd } },
        length: pickR([6, 7], rand),
      };
    }
    // Mirror: there and back again, e.g. small, medium, large, medium, small, medium → large.
    const attr = pickR<Attr>(['size', 'shape', 'color', 'dots'], rand);
    const offset = intIn(0, 3, rand);
    const [a, b, c] = attr === 'size' ? [0, 1, 2] : attr === 'dots' ? [1, 2, 3].map((d) => d + offset) : distinct(domain(attr), 3, rand);
    const kind = kindFor(attr);
    return { kind, rule, base: baseTile(kind, rand), attrs: { [attr]: cycle([a, b, c, b]) }, length: pickR([6, 7], rand) };
  }
  // L9–10: two independent rules running at once.
  const variant = pickR(level === 10 ? ['shapes', 'dots', 'interleave'] : ['shapes', 'dots'], rand);
  if (variant === 'dots') {
    const period = pickR([2, 3], rand);
    const length = period === 3 ? 6 : 5;
    return {
      kind: 'dots',
      rule: 'twoRules',
      base: baseTile('dots', rand),
      attrs: { dots: { type: 'step', start: intIn(1, MAX_DOTS - length, rand), delta: 1 }, color: cycle(valuesFor('color', period, rand)) },
      length,
    };
  }
  if (variant === 'interleave') {
    return {
      kind: 'dots',
      rule: 'twoRules',
      base: baseTile('dots', rand),
      attrs: {
        dots: { type: 'interleave', even: { type: 'step', start: intIn(1, 3, rand), delta: 1 }, odd: { type: 'step', start: 9, delta: -1 } },
        color: cycle(valuesFor('color', 3, rand)),
      },
      length: 6,
    };
  }
  const [two, three] = shuffleR<Attr>(pickR<Attr[]>([['shape', 'color'], ['shape', 'size'], ['color', 'size']], rand), rand);
  return {
    kind: 'shape',
    rule: 'twoRules',
    base: baseTile('shape', rand),
    attrs: { [two]: cycle(valuesFor(two, 2, rand)), [three]: cycle(valuesFor(three, 3, rand)) },
    length: pickR([6, 7], rand),
  };
}

// ---------- solver: which next values would a reasonable person predict? ----------

function arithmeticNext(vals: number[]): number | null {
  if (vals.length < 3) return null;
  const d = vals[1] - vals[0];
  return vals.every((v, i) => i === 0 || v - vals[i - 1] === d) ? vals[vals.length - 1] + d : null;
}

/**
 * Next values predicted for one attribute by the "obvious" rule family:
 * repetition with any period seen at least twice, constant steps, and
 * interleaved steps. Used to reject ambiguous series and sneaky distractors.
 */
export function predictNext(vals: Value[], attr: Attr): Set<Value> {
  const out = new Set<Value>();
  const n = vals.length;
  for (let p = 1; p <= Math.floor(n / 2); p++) {
    if (vals.every((v, i) => i < p || v === vals[i - p])) out.add(vals[n - p]);
  }
  if (NUMERIC.includes(attr)) {
    const nums = vals as number[];
    const a = arithmeticNext(nums);
    if (a !== null) out.add(a);
    if (n >= 6) {
      const sub = nums.filter((_, i) => i % 2 === n % 2);
      const other = nums.filter((_, i) => i % 2 !== n % 2);
      const next = arithmeticNext(sub);
      if (next !== null && arithmeticNext(other) !== null) out.add(next);
    }
  }
  return out;
}

/** True if `tile` could reasonably continue `series` under the generator's rule or any obvious rule. */
export function isPossibleContinuation(series: Tile[], answer: Tile, tile: Tile, kind: TileKind): boolean {
  return RENDERED[kind].every((attr) => {
    if (tile[attr] === answer[attr]) return true;
    return predictNext(series.map((t) => t[attr]), attr).has(tile[attr]);
  });
}

/** Every obvious rule agrees with the generator's answer (or has nothing to say). */
export function isUnambiguous(series: Tile[], answer: Tile, kind: TileKind): boolean {
  return RENDERED[kind].every((attr) => [...predictNext(series.map((t) => t[attr]), attr)].every((v) => v === answer[attr]));
}

// ---------- distractors ----------

/** Similarity a level aims for: low levels use clearly different distractors, high levels near-misses. */
function targetSimilarity(level: number): number {
  return level <= 2 ? 1.5 : level <= 4 ? 2 : level <= 6 ? 2.5 : 3;
}

function candidateValues(attr: Attr, answer: Tile): Value[] {
  if (attr !== 'dots') return domain(attr).filter((v) => v !== answer[attr]);
  return [-2, -1, 1, 2].map((d) => answer.dots + d).filter((v) => v >= 1 && v <= MAX_DOTS);
}

function makeDistractors(spec: Spec, series: Tile[], answer: Tile, n: number, level: number, rand: Rand): Tile[] | null {
  const varying = Object.keys(spec.attrs) as Attr[];
  const scored: { tile: Tile; sim: number; shares: boolean }[] = [];
  for (const attr of RENDERED[spec.kind]) {
    for (const v of candidateValues(attr, answer)) {
      const tile = { ...answer, [attr]: v } as Tile;
      const seen = series.some((t) => t[attr] === v);
      // Wrong value on a changing attribute that already appears in the row is the classic near-miss.
      const sim = varying.includes(attr) ? (seen ? 3 : 2) : 1;
      scored.push({ tile, sim, shares: varying.length > 1 && varying.includes(attr) });
    }
  }
  if (varying.length > 1) {
    const [a1, a2] = varying;
    for (const v1 of candidateValues(a1, answer))
      for (const v2 of candidateValues(a2, answer)) scored.push({ tile: { ...answer, [a1]: v1, [a2]: v2 } as Tile, sim: 1.5, shares: false });
  }
  const target = targetSimilarity(level);
  const ranked = shuffleR(scored, rand)
    .filter((c) => !isPossibleContinuation(series, answer, c.tile, spec.kind))
    .sort((x, y) => {
      // L9–10: distractors that share all but one attribute with the answer come first.
      if (level >= 9 && x.shares !== y.shares) return x.shares ? -1 : 1;
      return Math.abs(x.sim - target) - Math.abs(y.sim - target);
    });
  const out: Tile[] = [];
  for (const c of ranked) {
    if (out.length === n) break;
    if (!out.some((t) => sameTile(t, c.tile))) out.push(c.tile);
  }
  return out.length === n ? out : null;
}

// ---------- public API ----------

/** Answer options per profile: 4 for Keep Sharp, 2–3 for Rebuild. */
export function optionCount(level: number, profile: Profile): number {
  if (profile === 'keepSharp') return 4;
  return level <= 4 ? 2 : 3;
}

export function generatePattern(level: number, options: number, rand: Rand = Math.random): PatternItem {
  const lvl = Math.min(10, Math.max(1, Math.round(level)));
  for (let attempt = 0; attempt < 100; attempt++) {
    const spec = specFor(lvl, rand);
    const series = Array.from({ length: spec.length }, (_, i) => tileAt(spec, i));
    const answer = tileAt(spec, spec.length);
    const all = [...series, answer];
    const inRange = all.every((t) => t.dots >= 0 && t.dots <= MAX_DOTS && (spec.kind !== 'dots' || t.dots >= 1));
    if (!inRange || !isUnambiguous(series, answer, spec.kind)) continue;
    const distractors = makeDistractors(spec, series, answer, options - 1, lvl, rand);
    if (!distractors) continue;
    return {
      kind: spec.kind,
      rule: spec.rule,
      varying: Object.keys(spec.attrs) as Attr[],
      series,
      answer,
      options: shuffleR([answer, ...distractors], rand),
    };
  }
  throw new Error(`patterns: could not generate level ${lvl}`);
}

/** A short example row for a rule card in the "Why?" step. */
export function ruleExample(rule: RuleKind, rand: Rand = Math.random): Tile[] {
  const level: Record<RuleKind, number> = { repeat2: 1, repeat3: 3, count: 3, together: 5, grow: 7, interleave: 7, mirror: 7, twoRules: 9 };
  for (let i = 0; i < 200; i++) {
    const item = generatePattern(level[rule], 2, rand);
    if (item.rule === rule) return item.series;
  }
  throw new Error(`patterns: no example for ${rule}`);
}

/** Rules that look too alike to be fair as alternatives in the "Why?" step. */
const CONFUSABLE: [RuleKind, RuleKind][] = [['count', 'grow']];

/** Correct rule plus `n - 1` alternatives, shuffled. */
export function whyChoices(rule: RuleKind, n: number, rand: Rand = Math.random): RuleKind[] {
  const others = RULES.filter((r) => r !== rule && !CONFUSABLE.some(([a, b]) => (a === rule && b === r) || (b === rule && a === r)));
  return shuffleR([rule, ...distinct(others, n - 1, rand)], rand);
}

/** Within-session staircase: two right in a row steps up; Rebuild steps down after one miss, Keep Sharp after two. */
export type Stair = { level: number; up: number; down: number };

export function stepStair(s: Stair, correct: boolean, profile: Profile, min = 1, max = 10): Stair {
  if (correct) {
    const up = s.up + 1;
    return up >= 2 ? { level: Math.min(max, s.level + 1), up: 0, down: 0 } : { ...s, up, down: 0 };
  }
  const down = s.down + 1;
  const limit = profile === 'rebuild' ? 1 : 2;
  return down >= limit ? { level: Math.max(min, s.level - 1), up: 0, down: 0 } : { ...s, up: 0, down };
}
