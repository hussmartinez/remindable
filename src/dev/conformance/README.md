# learn-sdk conformance vectors

These are copied from [`ie-huss-martinez/sdk-core`](https://github.com/ie-huss-martinez/sdk-core) at `packages/learn-sdk/conformance` (Apache-2.0, © Huss Martinez). `source.json` records the commit. Refresh them with `node scripts/sync-conformance.mjs`.

`npm test` runs them in Node (`src/engine/__tests__/conformance.test.ts`). A development build runs them on a phone at `/dev/conformance`, to check that FSRS scheduling, due items and the language profiles behave the same on Hermes (sdk-core ADR 0069).
