# 0005. Daily session = anchor game + domain rotation

- Status: Accepted
- Date: 2026-10-24

## Context
The evidence favours multidomain training, near transfer, structure and boosters (ACTIVE, U.S. POINTER, INCOG 2.0). Users need one short, predictable session each day, not a menu of games.

## Decision
`buildPlan()` (`src/engine/session.ts`) creates a fixed frame: an intention, then Memory Vault, then an **anchor** game, then Move & Think, then **two rotating** games, then delayed recall, then the close screen.
- The anchor is Quick Eye (speed training, as in ACTIVE) for Keep Sharp and Word Garden (naming) for Rebuild.
- The rotating slots cycle through domain groups A–E across the week (`src/games/catalog.ts`). Day 1 of each week is a Memory Toolkit lesson.
- Games from the previous session are avoided.
- The intention emoji never appears on timed or planning games.
- Each game reports `{correct, total}`, and `nextLevel()` keeps success near 80% (Keep Sharp) or 90% (Rebuild).

## Consequences
- A new game only needs a catalog entry with a domain and a component in the registry.
- Not implemented yet: the frustration guard, extra booster-week weighting, and hard-then-easy ordering (docs/NEXT-STEPS.md).
