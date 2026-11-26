# 0006. Write our own puzzle generators instead of embedding existing engines

- Status: Accepted
- Date: 2026-10-24

## Context
Simon Tatham's Portable Puzzle Collection (MIT) generates graded logic puzzles, but its UI isn't suitable for older or brain-injured users, it isn't localised or RTL-aware, and on native it would need a WebView bridge. Many other generators (qqwing, HoDoKu, RAVEN) are GPL.

## Decision
Write small TypeScript generators (`src/engine/logic/`, `patterns.ts`, `lightPath.ts`, `oddOneOut.ts`), following Tatham's approach:
- Generate a solution, then remove clues while a solver proves the solution is still unique.
- Grade difficulty by the deduction a person needs.
- Accept only puzzles that can be solved without guessing.
- No third-party puzzle code is copied.

## Consequences
- Full control over UI, levels, hints and RTL, with no licence obligations.
- Small grids keep generation in milliseconds. A test asserts phone-safe timing.
- Puzzle types the generators don't cover (Raven matrices, Kakuro) need new code; see docs/OPEN-SOURCE-LANDSCAPE.md §9.
