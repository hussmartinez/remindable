import { CONCEPTS, type CategoryId, type Concept } from '@/content/concepts';
import type { Profile } from './adaptive';
import { sample, shuffle } from './random';

/**
 * Memory Toolkit (docs/EXERCISE-CATALOG.md §2.18): one strategy a week,
 * taught as Learn → Try (predict, study, recall) → Reflect.
 * Metacognitive strategy training is INCOG 2.0 Level A in TBI; mnemonic
 * training was the ACTIVE memory arm. Progress is by strategy, not only by list length.
 */

export type ToolId = 'chunking' | 'visualise' | 'story' | 'palace' | 'writeDown' | 'stopThink';
export type LessonId = ToolId | 'mix';

/** Keep Sharp builds up to the method of loci; Rebuild starts from external aids, as INCOG recommends. */
export const LESSON_ORDER: Record<Profile, LessonId[]> = {
  keepSharp: ['chunking', 'visualise', 'story', 'palace', 'mix'],
  rebuild: ['writeDown', 'chunking', 'visualise', 'stopThink'],
};

/** Tools a "mix" lesson rotates through. */
export const MIX_TOOLS: ToolId[] = ['chunking', 'visualise', 'story', 'palace'];

export const TOOL_ICON: Record<LessonId, string> = {
  chunking: '🔢',
  visualise: '🎨',
  story: '📖',
  palace: '🏠',
  writeDown: '📝',
  stopThink: '🛑',
  mix: '🧰',
};

export type LessonRecord = {
  lesson: LessonId;
  /** The tool actually practised (a mix lesson practises one of MIX_TOOLS). */
  tool: ToolId;
  profile: Profile;
  day: string;
  predicted: number;
  correct: number;
  total: number;
  /** Answer to "Did the trick help?": true 👍, false 🤷, null not answered. */
  helped: boolean | null;
};

/** Stored in gameData under 'toolkit'. */
export type ToolkitData = {
  /** Index into LESSON_ORDER[profile] of the next lesson. */
  next: Partial<Record<Profile, number>>;
  history: LessonRecord[];
};

export const EMPTY_TOOLKIT: ToolkitData = { next: {}, history: [] };
const HISTORY_MAX = 40;

/**
 * The lesson to teach now. After the sequence, Keep Sharp stays on "mix"
 * (rotating tools); Rebuild cycles the sequence again as review.
 */
export function nextLesson(data: ToolkitData, profile: Profile): { lesson: LessonId; tool: ToolId } {
  const order = LESSON_ORDER[profile];
  const i = data.next[profile] ?? 0;
  const lesson = i < order.length ? order[i] : profile === 'keepSharp' ? 'mix' : order[i % order.length];
  if (lesson !== 'mix') return { lesson, tool: lesson };
  const mixes = data.history.filter((h) => h.profile === profile && h.lesson === 'mix').length;
  return { lesson, tool: MIX_TOOLS[mixes % MIX_TOOLS.length] };
}

export function recordLesson(data: ToolkitData, rec: LessonRecord): ToolkitData {
  return {
    next: { ...data.next, [rec.profile]: (data.next[rec.profile] ?? 0) + 1 },
    history: [...data.history, rec].slice(-HISTORY_MAX),
  };
}

/** The most recently taught tool, so other games can offer it as a hint. Null before the first lesson. */
export function getCurrentTool(data: ToolkitData | undefined | null, profile?: Profile): ToolId | null {
  const history = (data?.history ?? []).filter((h) => !profile || h.profile === profile);
  return history.length ? history[history.length - 1].tool : null;
}

// ---- Try-it material ----

/** Pictures to remember (list length grows with level; Rebuild stays shorter). */
export function listLength(level: number, profile: Profile, tool: ToolId): number {
  const l = Math.min(10, Math.max(1, level));
  const n = profile === 'rebuild' ? 3 + Math.floor((l - 1) / 3) : 4 + Math.floor((l - 1) / 2);
  return Math.min(n, tool === 'palace' ? ROOMS.length : 8);
}

export function digitCount(level: number, profile: Profile): number {
  if (profile === 'rebuild') return level <= 3 ? 4 : level <= 7 ? 6 : 8;
  return level <= 3 ? 6 : 8;
}

/** Random digits with no digit repeated back to back, so pairs read as clear two-digit numbers. */
export function makeDigits(n: number): number[] {
  const out: number[] = [];
  while (out.length < n) {
    const d = Math.floor(Math.random() * 10);
    if (d !== out[out.length - 1] && !(out.length % 2 === 0 && d === 0)) out.push(d);
  }
  return out;
}

/** "618429" → ["61", "84", "29"]. Pairs read as numbers in every language ("sixty-one"). */
export function chunk(digits: number[], size = 2): string[] {
  const out: string[] = [];
  for (let i = 0; i < digits.length; i += size) out.push(digits.slice(i, i + size).join(''));
  return out;
}

export function scoreDigits(target: number[], entered: number[]): { correct: number; total: number } {
  return { correct: target.filter((d, i) => entered[i] === d).length, total: target.length };
}

/** Everyday, easy-to-picture objects; body parts and places make poor list items. */
const LIST_CATS: CategoryId[] = ['fruit', 'food', 'animal', 'home', 'tool', 'clothing', 'vehicle', 'music', 'object'];
const SHOPPING_CATS: CategoryId[] = ['fruit', 'food'];

function listPool(tool: ToolId): Concept[] {
  const cats = tool === 'writeDown' ? SHOPPING_CATS : LIST_CATS;
  return CONCEPTS.filter((c) => cats.includes(c.cat) && c.tier <= 2);
}

/** Targets to study plus an equal number of foils from the same kinds of things, shuffled into one grid. */
export function makeList(n: number, tool: ToolId): { targets: Concept[]; grid: Concept[] } {
  const pool = listPool(tool);
  const picked = sample(pool, n * 2);
  const targets = picked.slice(0, n);
  return { targets, grid: shuffle(picked) };
}

/** Hits minus false alarms, so tapping everything does not score. */
export function scoreRecall(targetIds: string[], pickedIds: string[]): { correct: number; total: number; hits: number; falseAlarms: number } {
  const hits = pickedIds.filter((id) => targetIds.includes(id)).length;
  const falseAlarms = pickedIds.length - hits;
  return { correct: Math.max(0, hits - falseAlarms), total: targetIds.length, hits, falseAlarms };
}

/** Generic home loci, walked in a fixed order (door → sofa → TV → table → bed → shower). */
export const ROOMS = [
  { id: 'door', emoji: '🚪' },
  { id: 'sofa', emoji: '🛋️' },
  { id: 'tv', emoji: '📺' },
  { id: 'table', emoji: '🍽️' },
  { id: 'bed', emoji: '🛏️' },
  { id: 'shower', emoji: '🚿' },
] as const;
