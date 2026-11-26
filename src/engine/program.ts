import { daysBetween } from './dates';

/**
 * Training phases, modelled on ACTIVE: an initial core block, then booster
 * blocks around months 11 and 35. Only participants who did boosters showed
 * the long-term benefit, so the app calls them out.
 */
export type Phase =
  | { kind: 'core'; week: number; weeks: number }
  | { kind: 'maintenance' }
  | { kind: 'booster'; week: number; weeks: number };

const CORE_WEEKS = 6;
const BOOSTER_WEEKS = 2;
const BOOSTER_START_DAYS = [330, 1060];

export function phaseFor(startedOn: string, today: string): Phase {
  const day = Math.max(0, daysBetween(startedOn, today));
  if (day < CORE_WEEKS * 7) return { kind: 'core', week: Math.floor(day / 7) + 1, weeks: CORE_WEEKS };
  for (const start of BOOSTER_START_DAYS) {
    if (day >= start && day < start + BOOSTER_WEEKS * 7) {
      return { kind: 'booster', week: Math.floor((day - start) / 7) + 1, weeks: BOOSTER_WEEKS };
    }
  }
  return { kind: 'maintenance' };
}
