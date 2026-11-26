import { addDays } from './dates';

/** Days until the next review at each stage. Expanding intervals, as in spaced retrieval. */
export const INTERVALS = [1, 2, 4, 7, 14, 30, 60, 120];

export type ReviewState = {
  id: string;
  stage: number;
  due: string;
  reviews: number;
  lapses: number;
};

export function newReviewState(id: string, today: string): ReviewState {
  // First recall is tomorrow; same-day delayed recall happens inside the session.
  return { id, stage: 0, due: addDays(today, INTERVALS[0]), reviews: 0, lapses: 0 };
}

export function review(state: ReviewState, correct: boolean, today: string): ReviewState {
  const stage = correct ? Math.min(state.stage + 1, INTERVALS.length - 1) : Math.max(0, state.stage - 2);
  return {
    ...state,
    stage,
    due: addDays(today, INTERVALS[stage]),
    reviews: state.reviews + 1,
    lapses: state.lapses + (correct ? 0 : 1),
  };
}

export function dueItems(states: Record<string, ReviewState>, today: string, limit: number): ReviewState[] {
  return Object.values(states)
    .filter((s) => s.due <= today)
    .sort((a, b) => (a.due === b.due ? a.stage - b.stage : a.due < b.due ? -1 : 1))
    .slice(0, limit);
}
