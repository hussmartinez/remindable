export type Profile = 'keepSharp' | 'rebuild';

/**
 * Target success rate per profile.
 * Keep Sharp aims for "desirable difficulty"; Rebuild stays near-errorless.
 */
export const TARGET_SUCCESS: Record<Profile, number> = {
  keepSharp: 0.8,
  rebuild: 0.9,
};

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;

/** Move one level up or down after a block, keeping success near the profile target. */
export function nextLevel(level: number, correct: number, total: number, profile: Profile): number {
  if (total === 0) return level;
  const rate = correct / total;
  const target = TARGET_SUCCESS[profile];
  let next = level;
  if (rate >= target + 0.05 || rate === 1) next = level + 1;
  else if (rate < target - 0.15) next = level - 1;
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, next));
}

/**
 * Quick Eye display-time staircase (ACTIVE-style speed training).
 * Faster after a success, slower after a miss; the asymmetric steps settle
 * near ~80% (Keep Sharp) or ~90% (Rebuild) success.
 */
export function nextDisplayMs(ms: number, success: boolean, profile: Profile): number {
  const down = profile === 'rebuild' ? 0.92 : 0.85;
  const up = profile === 'rebuild' ? 1.5 : 1.35;
  const next = success ? ms * down : ms * up;
  return Math.round(Math.min(2000, Math.max(60, next)));
}

export const START_DISPLAY_MS: Record<Profile, number> = {
  keepSharp: 600,
  rebuild: 1000,
};
