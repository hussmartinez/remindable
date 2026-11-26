import type { Script, Step } from '@/content/scripts';
import type { Profile } from './adaptive';
import { pick, shuffle } from './random';

/**
 * Step by Step: put the steps of an everyday script in order (INCOG functional,
 * contextual EF training). Harder levels add an intruder card to leave out,
 * a "what's missing?" step and two interleaved scripts.
 */

/** A step card. `index` is its position in its script, or -1 for an intruder. */
export type Card = Step & { id: string; script: string; index: number };

export type OrderRound = {
  kind: 'order';
  scripts: Script[];
  /** Shuffled cards to place, including any intruder. */
  pool: Card[];
  /** Number of slots (real steps). */
  slots: number;
  /** Rebuild: the first step, already placed. */
  prePlaced: Card | null;
};

export type MissingRound = {
  kind: 'missing';
  script: Script;
  /** The steps in order, with `null` where the missing one goes. */
  shown: (Card | null)[];
  answer: Card;
  options: Card[];
};

export type StepRound = OrderRound | MissingRound;

type RoundSpec = { kind: 'order'; steps: number; intruder: boolean } | { kind: 'missing'; steps: number } | { kind: 'interleave'; a: number; b: number };

export type StepsConfig = { rounds: RoundSpec[]; errorless: boolean; prePlace: boolean };

const order = (steps: number, intruder = false): RoundSpec => ({ kind: 'order', steps, intruder });
const missing = (steps: number): RoundSpec => ({ kind: 'missing', steps });
const weave = (a: number, b: number): RoundSpec => ({ kind: 'interleave', a, b });

export function stepsConfig(level: number, profile: Profile): StepsConfig {
  const lv = Math.min(10, Math.max(1, Math.round(level)));
  if (profile === 'rebuild') {
    const n = lv <= 5 ? 3 : 4;
    return { rounds: Array.from({ length: 4 }, () => order(n)), errorless: true, prePlace: true };
  }
  const table: RoundSpec[][] = [
    [order(3), order(3), order(3), order(3)],
    [order(4), order(4), order(4), order(4)],
    [order(5), order(5), order(5), order(5)],
    [order(6), order(5), order(6), order(5)],
    [order(4, true), order(5), order(4, true), order(5, true)],
    [order(5, true), order(6, true), order(5, true), order(6)],
    [order(5, true), missing(5), order(6, true), missing(5)],
    [order(6, true), missing(5), order(6, true), missing(6)],
    [order(6, true), weave(3, 3), missing(6), weave(3, 3)],
    [weave(3, 3), missing(6), order(6, true), weave(4, 3)],
  ];
  return { rounds: table[lv - 1], errorless: false, prePlace: false };
}

const toCard = (script: Script, step: Step, index: number): Card => ({
  ...step,
  id: `${script.id}:${index}`,
  script: script.id,
  index,
});

/**
 * Keep `n` consecutive steps of a script. A contiguous window keeps every
 * step's precondition in view; picking scattered steps could leave e.g.
 * "close the suitcase" without "open the suitcase".
 */
export function subsample(script: Script, n: number): Script {
  const k = script.steps.length;
  if (n >= k) return script;
  const start = Math.floor(Math.random() * (k - n + 1));
  return { ...script, steps: script.steps.slice(start, start + n) };
}

const cardsOf = (script: Script) => script.steps.map((st, i) => toCard(script, st, i));

const emojiSet = (sc: Script) => new Set([...sc.steps.map((x) => x.emoji), sc.intruder.emoji]);
/** Two scripts can be interleaved only if no card looks like a card of the other. */
export const disjoint = (a: Script, b: Script) => {
  const ea = emojiSet(a);
  return a.id !== b.id && [...emojiSet(b)].every((e) => !ea.has(e));
};

/** Shuffle so the cards are never already in order. */
function scramble(cards: Card[]): Card[] {
  if (cards.length < 2) return cards;
  for (let i = 0; i < 20; i++) {
    const s = shuffle(cards);
    if (!isValidOrder(s.filter((c) => c.index >= 0))) return s;
  }
  return [...cards].reverse();
}

export function makeRounds(cfg: StepsConfig, scripts: Script[], recent: string[] = []): StepRound[] {
  // Prefer scripts not seen recently, but never run out.
  const fresh = shuffle(scripts.filter((s) => !recent.includes(s.id)));
  const queue = [...fresh, ...shuffle(scripts.filter((s) => recent.includes(s.id)))];
  const used = new Set<string>();
  const take = (min: number, avoid?: Script) => {
    const ok = (s: Script) => !used.has(s.id) && s.steps.length >= min && (!avoid || disjoint(s, avoid));
    const s = queue.find(ok) ?? scripts.find((x) => x.steps.length >= min && (!avoid || disjoint(x, avoid)))!;
    used.add(s.id);
    return s;
  };

  return cfg.rounds.map((spec): StepRound => {
    if (spec.kind === 'missing') return makeMissing(subsample(take(spec.steps), spec.steps), scripts);
    if (spec.kind === 'interleave') {
      const a = subsample(take(spec.a), spec.a);
      const b = subsample(take(spec.b, a), spec.b);
      return { kind: 'order', scripts: [a, b], pool: scramble([...cardsOf(a), ...cardsOf(b)]), slots: spec.a + spec.b, prePlaced: null };
    }
    const sc = subsample(take(spec.steps), spec.steps);
    const cards = cardsOf(sc);
    const prePlaced = cfg.prePlace ? cards[0] : null;
    const rest = prePlaced ? cards.slice(1) : cards;
    const pool = spec.intruder ? [...rest, toCard(sc, sc.intruder, -1)] : rest;
    return { kind: 'order', scripts: [sc], pool: scramble(pool), slots: cards.length, prePlaced };
  });
}

/** "What's missing?": a middle step is hidden; distractors are a step already shown and an unrelated step. */
export function makeMissing(script: Script, all: Script[]): MissingRound {
  const cards = cardsOf(script);
  const gap = 1 + Math.floor(Math.random() * (cards.length - 2));
  const answer = cards[gap];
  const shownOther = pick(cards.filter((_, i) => i !== gap));
  const others = all.filter((x) => x.id !== script.id && !script.steps.some((st) => st.emoji === x.intruder.emoji));
  const odd = pick(others);
  const intruder = toCard(odd, odd.intruder, -1);
  return {
    kind: 'missing',
    script,
    shown: cards.map((c, i) => (i === gap ? null : c)),
    answer,
    options: shuffle([answer, shownOther, intruder]),
  };
}

/**
 * Per-slot correctness. A card is right when exactly the earlier steps of its
 * own script come before it, so any interleaving of two scripts that keeps
 * each in order is accepted. Intruders are never right.
 */
export function scoreOrder(placed: Card[]): boolean[] {
  const seen: Record<string, number> = {};
  return placed.map((c) => {
    const before = seen[c.script] ?? 0;
    if (c.index >= 0) seen[c.script] = before + 1;
    return c.index >= 0 && c.index === before;
  });
}

export const isValidOrder = (placed: Card[]) => scoreOrder(placed).every(Boolean);

/** Cards that may correctly go in the next slot, given those already placed. */
export function nextOptions(placed: Card[], round: OrderRound): Card[] {
  const all = [...(round.prePlaced ? [round.prePlaced] : []), ...round.pool];
  return all.filter((c) => !placed.some((p) => p.id === c.id) && isValidOrder([...placed, c]));
}

/** One correct full order (used to reveal the answer). */
export const correctOrder = (round: OrderRound): Card[] => round.scripts.flatMap(cardsOf);
