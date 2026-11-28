# 0009. Schedule and grade with learn-sdk

- Status: Accepted
- Date: 2026-11-27

## Context
Remindable had its own spaced-retrieval ladder (`srs.ts`) and its own es/en/ar answer matcher (`wordMatch.ts`, `textNorm.ts`). The `@hussmartinez` SDK family's learn-sdk (Apache-2.0, same author) now has a Hermes-safe core (sdk-core ADR 0069, learn-sdk ADR 0010) with:
- an FSRS-7 scheduler;
- `dueItems`;
- es, en and ar language profiles, ported from Remindable;
- `matchTolerantly`.

Each is covered by conformance vectors.

## Decision
- **Scheduling:** Memory Vault schedules with learn-sdk's FSRS scheduler (`src/engine/srs.ts` is now an adapter). A recall rates `good` when right and `again` when not. There's no `hard` or `easy`, because the recall is errorless. Today's delayed recall is each new item's first FSRS review.
- **App counters:** Remindable keeps its own counters next to the opaque FSRS state (reviews, lapses, the current run of correct recalls) for app rules such as moving a well-learned object.
- **Migration:** store version 3 turns 0.1's interval states into FSRS cards. They keep their due day and counters; stability is relearned.
- **Spoken answers:** matched with `matchTolerantly` and the built-in profile. Remindable only adds its synonym lists.
- **Device check:** learn-sdk's scheduling, due-items and matching vectors are copied into `src/dev/conformance/` (`scripts/sync-conformance.mjs`). Jest runs them, and a development build runs them on a device at `/dev/conformance`, so the Hermes check that ADR 0069 asks for is one tap.

## Consequences
- One shared implementation, tested in both repositories.
- Bugs in the SDK are fixed upstream and reported to the family reviewer.
- `@hussmartinez/learn-sdk` and `@hussmartinez/ui` are exact-pinned. Only one copy of ui is allowed (learn-sdk depends on ui ^0.17).
- Jest transforms the family's ESM-only packages (`transformIgnorePatterns`).
- `textNorm.ts` still serves Word Finder and "Where were we?" (stop words, tokens). Moving those to the profiles is follow-up work.
- `@hussmartinez/ui` is pinned directly so the app keeps one copy. `ui/native` (with `react-native-svg`) is adopted in a separate change.
