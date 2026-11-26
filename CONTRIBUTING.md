# Contributing to Remindable

Thanks for helping! Remindable is used by older adults and people recovering from brain injury, so **calm, clear and kind** beats clever.

## Ways to help
- **Translations:** native-speaker review of Spanish and Arabic is the most valuable contribution right now. See [docs/NEXT-STEPS.md](docs/NEXT-STEPS.md) §1. Use the "Translation fix" issue template, or edit the files under `src/i18n/` and `src/content/` directly.
- **Testing on devices:** especially speech recognition and text-to-speech in Arabic and Spanish.
- **New exercises:** designs and their evidence are in [docs/EXERCISE-CATALOG.md](docs/EXERCISE-CATALOG.md).

## Setup
```bash
npm ci
npx expo start --web     # or: npx expo run:android / run:ios (needed for speech)
```
Open a single game at `/dev/<gameId>?lang=ar&ui=es&profile=rebuild&level=5`.

## Rules for every change
- **Small, focused pull requests** with a [Conventional Commit](https://www.conventionalcommits.org/) title (`feat(pillBox): …`, `fix(i18n): …`). PRs are squash-merged into a linear `main`.
- **Checks pass:** `npx tsc --noEmit`, `npx expo lint`, `npm test`. CI runs the same.
- **Significant decisions** get an ADR in [docs/adr/](docs/adr/).
- **UX rules for users:**
  - One task per screen, big tap targets, no red ✗: a wrong answer turns into a hint.
  - Never use timers in the Rebuild profile.
  - All text exists in es, en and ar; Arabic must work RTL (see ADR 0003).
  - Emoji must be from Unicode 11 or earlier (ADR 0008).
- **Wording:** no medical claims (ADR 0004).
- **Privacy:** no analytics or network calls with user data (ADR 0002).

## Adding a game
1. Add the id, icon and domain to `src/games/catalog.ts`.
2. Create `src/games/<Name>.tsx` and register it in `src/games/registry.tsx`.
3. Put strings in `src/i18n/games/<id>.ts` (`en`/`es`/`ar`), and add `games.<id>` and `games.<id>Desc` to the base files in `src/i18n/`.
4. Put pure logic in `src/engine/` with Jest tests.
5. Call `onDone({ correct, total })` once. Levels adapt automatically.

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE), and that you'll follow the [Code of Conduct](CODE_OF_CONDUCT.md).
