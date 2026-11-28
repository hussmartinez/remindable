# Remindable

Mind training for older adults who want to keep their memory sharp, and for people recovering from a brain injury.
One Expo codebase targets iOS, Android (phones and tablets) and the web as an installable PWA.
Spanish, English and Arabic (RTL), and users can practise in several languages at once.

> **Status: early (0.1).** It works end to end, but the Spanish and Arabic text still needs native-speaker review. See [docs/NEXT-STEPS.md](docs/NEXT-STEPS.md).
>
> Remindable is **mind training, not a medical device**. It does not diagnose, prevent or treat any condition. If you're worried about your memory, talk to a doctor.

**Docs**
- [Research and design](docs/RESEARCH-AND-DESIGN.md)
- [Exercise catalog](docs/EXERCISE-CATALOG.md)
- [Open-source landscape](docs/OPEN-SOURCE-LANDSCAPE.md)
- [Architecture decisions](docs/adr/)
- [Next steps](docs/NEXT-STEPS.md)

## Run

```bash
npm ci
npm run web        # browser / PWA
npm run android    # Expo Go or dev build
npm run ios
npm test           # engine + content tests
npm run typecheck
npx expo lint
```

## How a session works

`src/engine/session.ts` builds a ~12 minute daily plan:

1. **Intro**: today's games.
2. **Plant an intention**: an emoji to tap when it shows up later (prospective memory). It never appears on timed or planning games.
3. **Memory Vault**: due spaced-retrieval reviews, then 1–4 new name/face or object/place pairs.
4. **Anchor game**: Quick Eye (Keep Sharp, ACTIVE-style speed training) or Word Garden (Rebuild, naming).
5. **Move & Think**: one-minute cognitive-motor dual task.
6. **Two rotating games**: they cycle through domain groups across the week (`src/games/catalog.ts`). Day 1 of each week is a Memory Toolkit lesson, and games from the previous session are avoided.
7. **Memory Vault, later**: delayed recall of today's new pairs.
8. **Close**: intention check, share with family.

| Domain | Games |
|---|---|
| A. Speed / attention | Quick Eye |
| B. Memory | Memory Vault (daily), Light Path |
| C. Reasoning | Pattern Path, Logic Corner (mini sudoku, number cages, picture grids) |
| D. Language | Word Garden, Story Thread, Odd One Out & Links |
| E. Everyday life | Pill Box, Step by Step |
| F. Strategy | Memory Toolkit |

Difficulty adapts per game (`src/engine/adaptive.ts`). Keep Sharp targets ~80% success, Rebuild ~90%.
Training phases (core 6 weeks → maintenance → booster weeks) are in `src/engine/program.ts`.
Exercise designs and evidence: [docs/EXERCISE-CATALOG.md](docs/EXERCISE-CATALOG.md).

## Tools (home screen)

- **Word Finder**: tip-of-the-tongue rescue. Describe a thing (group, place, use, or spoken/typed words), get picture candidates, and add the word to Word Garden practice. Works offline over the app's concept list.
- **Where were we?**: live captions of the last few minutes of a conversation, plus a recap (last sentences, topic words, pinned topic). It is kept in memory only.

Speech recognition (`expo-speech-recognition`) powers these tools and the 🎤 "Say it" button in Word Garden.
- On a phone it needs a **development build** (`npx expo run:android` / `run:ios` or an EAS dev build). Expo Go does not include the module.
- On the web it uses the browser's Web Speech API (Chrome).
- Without speech, every screen falls back to tapping.

## Development

- `/dev/<gameId>?lang=ar&ui=es&profile=rebuild&level=5` renders one game on its own.
- In development builds the session header has a ⏭ button that skips a step without scoring it.
- Game ids are in `src/games/catalog.ts`. Each game's strings live in `src/i18n/games/<id>.ts`.

## Layout

```
src/app/         routes: onboarding, home, session, settings, word-finder, where-were-we, dev/[game]
src/games/       one component per game (+ catalog.ts metadata, registry.tsx)
src/engine/      pure logic: SRS, adaptive difficulty, session plan, puzzle generators, word matching
src/content/     concepts, stories, scripts, vault pairs, move tasks, all in es/en/ar
src/i18n/        UI strings (base + per-game files in i18n/games/)
src/state/       zustand store persisted to AsyncStorage (local only, no account)
```

RTL is applied with the `direction` style (root + per-content `Dir`, and `NoFlip` for physical layouts), not `I18nManager`, so switching to Arabic needs no restart, and Arabic content can appear inside a Spanish or English UI.

## Known gaps

- Arabic and Spanish content should be reviewed by native speakers.
- No backend yet: the "buddy" is only the system share sheet.
- Pictures are emoji. A standardized naming set (e.g. MultiPic, license pending) would be better for Word Garden.
- Speech features need on-device testing: continuous listening on iOS, and on Android ≤ 12.
- Light Path tones play on web only, and logic puzzles have no undo yet.
- Microphone permission strings in app.json are English only.
- No service worker yet, so the PWA installs but does not work offline.
- Not a medical device. Wording avoids any treatment or prevention claims (ADR 0004).

## Contributing

Translations, device testing and new exercises are all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and the [security policy](SECURITY.md).

## Third-party packages

Scheduling and spoken-answer matching use [`@hussmartinez/learn-sdk`](https://www.npmjs.com/package/@hussmartinez/learn-sdk) (Apache-2.0), and its conformance vectors are in `src/dev/conformance/`. See [ADR 0009](docs/adr/0009-use-the-family-sdks.md).

## License

[MIT](LICENSE) © 2026 Huss Martinez
