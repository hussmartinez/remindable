import { createFsrsScheduler, dueItems, type CardRecord } from '@hussmartinez/learn-sdk';

/**
 * Spaced retrieval for Memory Vault, on learn-sdk's FSRS scheduler (ADR 0009).
 * The SDK owns the scheduling state, which is opaque by design; Remindable
 * keeps its own small counters next to it for app rules such as "move a
 * well-learned object to a new place".
 */

const scheduler = createFsrsScheduler();

export type VaultCard = {
  card: CardRecord;
  reviews: number;
  lapses: number;
  /** Correct recalls in a row. */
  streak: number;
};

/** Correct recalls in a row after which an object's place counts as well learned. */
export const WELL_LEARNED_STREAK = 4;

export function newCard(id: string, now: number): VaultCard {
  const { state, due } = scheduler.initial(now);
  return { card: { itemId: id, scheduling: state, due }, reviews: 0, lapses: 0, streak: 0 };
}

/** Errorless recall has no "hard" or "easy": a recall is either right (`good`) or not (`again`). */
export function reviewCard(v: VaultCard, correct: boolean, now: number): VaultCard {
  const { state, due } = scheduler.review(v.card.scheduling, correct ? 'good' : 'again', now);
  return {
    card: { ...v.card, scheduling: state, due },
    reviews: v.reviews + 1,
    lapses: v.lapses + (correct ? 0 : 1),
    streak: correct ? v.streak + 1 : 0,
  };
}

/** Cards due at `now`, longest overdue first. */
export function dueCards(cards: Record<string, VaultCard>, now: number, limit: number): VaultCard[] {
  const due = dueItems({ cards: Object.values(cards).map((c) => c.card) }, now, { limit });
  return due.map((c) => cards[c.itemId]).filter(Boolean);
}

/** The end of a local calendar day, so a session counts anything due later today. */
export function endOfDay(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

/** Remindable 0.1's expanding-interval state (store version 2). */
export type LegacyReviewState = { id: string; stage: number; due: string; reviews: number; lapses: number };

/**
 * Carries a 0.1 item over to FSRS. The old stages can't be turned into FSRS
 * stability faithfully, so the item starts as a new FSRS card. It keeps the
 * day it was due and its counters, and FSRS learns its stability again at
 * the next reviews.
 */
export function migrateLegacy(old: LegacyReviewState, now: number): VaultCard {
  const fresh = newCard(old.id, now);
  const [y, m, d] = old.due.split('-').map(Number);
  return {
    card: { ...fresh.card, due: new Date(y, m - 1, d).getTime() },
    reviews: old.reviews,
    lapses: old.lapses,
    streak: old.stage,
  };
}
