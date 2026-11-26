# 0002. Keep all user data on the device

- Status: Accepted
- Date: 2026-10-07

## Context
Training results, memory items and conversation text say a lot about a person's cognitive health. A backend would need accounts, which are a barrier for older users, plus hosting and health-data compliance.

## Decision
Store everything locally in a zustand store persisted to AsyncStorage (localStorage on the web), with versioned migrations (`src/state/store.ts`). No accounts, no analytics. "Where were we?" keeps conversation text in memory for a few minutes and never writes it to disk.

## Consequences
- Privacy by default, with nothing to secure on a server.
- Progress is lost when a phone is replaced, and there is no family dashboard. A future backend (the "buddy" feature) must be opt-in and get its own ADR.
- Speech recognition may still send audio to the platform's or browser's provider. The UI says so when on-device recognition isn't available (ADR 0007).
