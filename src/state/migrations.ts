import { migrateLegacy, type LegacyReviewState, type VaultCard } from '@/engine/srs';

/** Migrations run in order, so a store from any earlier version reaches the current one. */
export function migrateState(state: Record<string, unknown>, version: number, now = Date.now()): Record<string, unknown> {
  let next = { ...state };
  if (version < 2) next = { ...next, gameData: {}, recentGames: [] };
  if (version < 3) {
    // 0.1's interval ladder → learn-sdk FSRS cards (ADR 0009).
    const legacy = (next.vaultReviews ?? {}) as Record<string, LegacyReviewState>;
    const vaultCards: Record<string, VaultCard> = {};
    for (const old of Object.values(legacy)) vaultCards[old.id] = migrateLegacy(old, now);
    delete next.vaultReviews;
    next = { ...next, vaultCards };
  }
  return next;
}
