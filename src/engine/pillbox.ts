import type { Profile } from './adaptive';
import { pick, sample, shuffle } from './random';

/**
 * Pill Box: fill a weekly organiser from a plain prescription card, then answer
 * "It's Wednesday at noon. Which pills?". Modelled on ACTIVE's medication-label
 * everyday-problem items (Rebok 2014). Pills are generic colour + shape, never drugs.
 */

/** Canonical weekday, 0 = Monday … 6 = Sunday. */
export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const SLOTS = ['morning', 'noon', 'night'] as const;
export type Slot = (typeof SLOTS)[number];

export const PILL_COLORS = ['blue', 'white', 'yellow', 'pink', 'green', 'orange'] as const;
export const PILL_SHAPES = ['round', 'square', 'long'] as const;
export type PillColor = (typeof PILL_COLORS)[number];
export type PillShape = (typeof PILL_SHAPES)[number];
export type Pill = { id: string; color: PillColor; shape: PillShape };

export type DayRule = { kind: 'daily' } | { kind: 'only'; days: Day[] } | { kind: 'everyOther'; start: Day };
/** A doctor's change from `from` (inclusive): stop the pill, or add a dose time. */
export type Change = { kind: 'stop'; from: Day } | { kind: 'add'; from: Day; slot: Slot };

export type Rule = {
  pill: string;
  slots: Slot[];
  days: DayRule;
  /** Phrase the times as meals (breakfast / lunch / dinner) so the user has to translate. */
  withFood: boolean;
  change?: Change;
};

/** Rule features in the order they are introduced (catalog §2.7). */
export type Tier = 'daily' | 'twice' | 'days' | 'everyOther' | 'food' | 'change';
const TIERS: Tier[] = ['daily', 'twice', 'days', 'everyOther', 'food', 'change'];

export type PillConfig = {
  pills: number;
  tier: Tier;
  days: 1 | 3 | 7;
  hideCard: boolean;
  rounds: number;
  questions: number;
  errorless: boolean;
};

const KS: [number, Tier, 1 | 3 | 7][] = [
  [1, 'daily', 1],
  [2, 'twice', 1],
  [2, 'twice', 3],
  [3, 'days', 3],
  [3, 'everyOther', 7],
  [3, 'food', 7],
  [4, 'food', 7],
  [4, 'change', 7],
  [4, 'change', 7],
  [4, 'change', 7],
];

export function pillConfig(level: number, profile: Profile): PillConfig {
  const lv = Math.min(10, Math.max(1, Math.round(level)));
  if (profile === 'rebuild') {
    // One day, 1–2 pills, card always visible; rules stay within one day.
    const pills = lv <= 3 ? 1 : 2;
    const tier: Tier = lv <= 2 ? 'daily' : lv <= 6 ? 'twice' : 'food';
    return { pills, tier, days: 1, hideCard: false, rounds: 3, questions: 1, errorless: true };
  }
  const [pills, tier, days] = KS[lv - 1];
  const rounds = days === 1 ? 3 : days === 3 ? 2 : 1;
  return { pills, tier, days, hideCard: lv >= 9, rounds, questions: days === 7 ? 3 : 1, errorless: false };
}

/** Display order of the week: Monday-first for es/en, Saturday-first for ar. */
export function weekOrder(lang: string): Day[] {
  const start = lang === 'ar' ? 5 : 0;
  return Array.from({ length: 7 }, (_, i) => ((start + i) % 7) as Day);
}

export type Round = { pills: Pill[]; rules: Rule[]; days: Day[] };

const tierIndex = (t: Tier) => TIERS.indexOf(t);

function pickSlots(twice: boolean): Slot[] {
  if (!twice || Math.random() < 0.4) return [pick(SLOTS)];
  return pick<Slot[]>([
    ['morning', 'night'],
    ['morning', 'noon'],
    ['noon', 'night'],
  ]);
}

function makeRule(pill: string, features: Set<Tier>, days: Day[], force?: Tier): Rule {
  const twice = features.has('twice') && (force === 'twice' || Math.random() < 0.6);
  let slots = pickSlots(twice);
  if (force === 'twice' && slots.length < 2) slots = ['morning', 'night'];
  let dayRule: DayRule = { kind: 'daily' };
  const wantDays = force === 'days' || (features.has('days') && !force && Math.random() < 0.35);
  const wantOther = force === 'everyOther' || (features.has('everyOther') && !force && Math.random() < 0.3);
  if (days.length >= 3 && wantOther) dayRule = { kind: 'everyOther', start: days[0] };
  else if (days.length >= 3 && wantDays) {
    const n = days.length === 3 ? pick([1, 2]) : pick([2, 3]);
    dayRule = { kind: 'only', days: sortByWeek(sample(days, n), days) };
  }
  const withFood = force === 'food' || (features.has('food') && !force && Math.random() < 0.3);
  return { pill, slots: sortSlots(slots), days: dayRule, withFood };
}

const sortSlots = (s: Slot[]) => [...s].sort((a, b) => SLOTS.indexOf(a) - SLOTS.indexOf(b));
const sortByWeek = (picked: Day[], order: Day[]) => [...picked].sort((a, b) => order.indexOf(a) - order.indexOf(b));

/** A schedule for one round. `order` is the locale's week order (see weekOrder). */
export function makeRound(cfg: PillConfig, order: Day[] = weekOrder('en')): Round {
  const startAt = cfg.days === 7 ? 0 : Math.floor(Math.random() * (8 - cfg.days));
  const days = order.slice(startAt, startAt + cfg.days);
  const colors = sample(PILL_COLORS, cfg.pills);
  const shapes = shuffle(PILL_SHAPES);
  const pills: Pill[] = colors.map((color, i) => ({ id: color, color, shape: shapes[i % shapes.length] }));

  const top = tierIndex(cfg.tier);
  const features = new Set(TIERS.slice(0, top + 1));
  // The newest feature appears on one pill each round so the level means something.
  const forced: Tier | undefined = cfg.tier === 'daily' || cfg.tier === 'change' ? undefined : cfg.tier;
  const forcedAt = Math.floor(Math.random() * pills.length);
  const rules = pills.map((p, i) => makeRule(p.id, features, days, i === forcedAt ? forced : undefined));

  if (cfg.tier === 'change' && days.length >= 3) {
    // Change a daily rule so the change always has a visible effect.
    const target = pick(rules.filter((r) => r.days.kind === 'daily')) ?? rules[0];
    target.days = { kind: 'daily' };
    const from = days[1 + Math.floor(Math.random() * (days.length - 2))];
    const free = SLOTS.filter((s) => !target.slots.includes(s));
    target.change = free.length && Math.random() < 0.5 ? { kind: 'add', from, slot: pick(free) } : { kind: 'stop', from };
  }
  return { pills, rules, days };
}

/** Whether the rule's pill is due on `day` at `slot`, within the round's grid `days`. */
export function takes(rule: Rule, day: Day, slot: Slot, days: Day[]): boolean {
  const pos = days.indexOf(day);
  if (pos < 0) return false;
  const changed = rule.change !== undefined && pos >= days.indexOf(rule.change.from);
  if (changed && rule.change?.kind === 'stop') return false;
  const onDay =
    rule.days.kind === 'daily' ||
    (rule.days.kind === 'only' && rule.days.days.includes(day)) ||
    (rule.days.kind === 'everyOther' && (pos - days.indexOf(rule.days.start)) % 2 === 0 && pos >= days.indexOf(rule.days.start));
  if (!onDay) return false;
  return rule.slots.includes(slot) || (changed && rule.change?.kind === 'add' && rule.change.slot === slot);
}

export const cellKey = (day: Day, slot: Slot) => `${day}|${slot}`;
/** Organiser contents: cell key → pill ids in that compartment. */
export type Fill = Record<string, string[]>;

export function expectedFill(round: Round): Fill {
  const fill: Fill = {};
  for (const d of round.days)
    for (const s of SLOTS) fill[cellKey(d, s)] = round.rules.filter((r) => takes(r, d, s, round.days)).map((r) => r.pill);
  return fill;
}

/** Per pill: true if it sits in exactly the right compartments. */
export function checkFill(round: Round, fill: Fill): Record<string, boolean> {
  const want = expectedFill(round);
  const out: Record<string, boolean> = {};
  for (const p of round.pills) {
    out[p.id] = Object.keys(want).every((k) => want[k].includes(p.id) === (fill[k] ?? []).includes(p.id));
  }
  return out;
}

export type Question = { day: Day; slot: Slot; answer: string[]; options: string[][] };

const setKey = (ids: string[]) => [...ids].sort().join('+');

/** "It's <day> at <slot>. Which pills?" with the answer always among the options. */
export function makeQuestion(round: Round, nOptions = 3): Question {
  const want = expectedFill(round);
  const cells = round.days.flatMap((d) => SLOTS.map((s) => ({ d, s, ids: want[cellKey(d, s)] })));
  const full = cells.filter((c) => c.ids.length > 0);
  // Mostly ask about a compartment with pills; sometimes the right answer is "none".
  const c = full.length && Math.random() < 0.85 ? pick(full) : pick(cells);
  const order = round.pills.map((p) => p.id);
  const sorted = (ids: string[]) => order.filter((id) => ids.includes(id));
  const options = [sorted(c.ids)];
  const seen = new Set([setKey(c.ids)]);
  const candidates = shuffle([
    ...order.map((id) => (c.ids.includes(id) ? c.ids.filter((x) => x !== id) : [...c.ids, id])),
    ...cells.map((x) => x.ids),
    [],
  ]);
  for (const cand of candidates) {
    if (options.length >= nOptions) break;
    const k = setKey(cand);
    if (seen.has(k)) continue;
    seen.add(k);
    options.push(sorted(cand));
  }
  return { day: c.d, slot: c.s, answer: sorted(c.ids), options: shuffle(options) };
}

export const sameSet = (a: string[], b: string[]) => setKey(a) === setKey(b);
