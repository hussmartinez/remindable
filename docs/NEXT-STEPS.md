# Remindable: Next Steps

_Status as of 2026-10-28._ This is everything that is planned, partly done or still to verify, written so work can resume on another machine.

## 0. Repository housekeeping

- [x] Moved to the new server, first commit made, published as open source (MIT).
- [x] **Expo patch updates** (expo, expo-constants, expo-linking, expo-router), applied 2026-11-27.
- [ ] **Branding.** The app icon, splash screen and `public/logo*.png` are still Expo placeholders. Bundle ids are `xyz.hussmartinez.remindable`.
- [ ] **EAS.** There is no `eas.json` yet. Run `npx eas-cli@latest build:configure` and add a development profile, which the speech features need.
- [ ] **README screenshots.** Use `scripts/e2e/` to generate them.

## 1. Before real users use it

- [ ] **Native-speaker review of all Spanish and Arabic text.** Agents wrote it, and none of it has been reviewed. Files:
  - `src/i18n/{es,ar}.ts` and every `src/i18n/games/*.ts`
  - `src/content/concepts.ts`, `stories.ts`, `scripts.ts`, `vault.ts`, `moves.ts`
  - Keyword and synonym lists in `src/engine/reverseDictionary.ts` and `src/engine/wordMatch.ts`
  - Specific flags:
    - Arabic: masculine-default user forms ("أنا جاهز"), gender agreement in Pattern Path tile names, the sudoku box word (صندوق), and words like بوظة / كتكوت / كشّاف / دُش / سلطعون.
    - Spanish: "Revisar", "caracola", "bombilla", and the rule texts in Pattern Path.
- [ ] **Decide tú vs usted** for Spanish. It uses "tú" everywhere now; many older users may prefer "usted".
- [ ] **Check each emoji's colour tag** used by Odd One Out on real Android and iOS devices, since emoji art differs between platforms.
- [ ] **Cultural review** of Odd One Out categories and analogies, and of the Step by Step scripts.
- [ ] **Localize the microphone permission strings** in `app.json`; they are English only. Use expo-localization `locales` in app.json.

## 2. Device testing (needs a development build)

- [ ] **Build and install:** `npx expo run:android` / `run:ios`, or an EAS development build. Expo Go does not include `expo-speech-recognition`.
- [ ] **Speech recognition** in Word Garden ("Say it"), Word Finder and "Where were we?" for es-ES, en-US and ar-SA:
  - on-device versus network fallback
  - continuous mode on iOS (results may accumulate)
  - Android ≤ 12, where continuous mode is unsupported
- [ ] **learn-sdk on Hermes:** open `/dev/conformance` on an iPhone and an Android phone (development build). Every case should pass; report failures to the SDK family reviewer. sdk-core ADR 0069 keeps the native entries experimental until this check and a VoiceOver/TalkBack pass are done.
- [ ] **TTS voices** on each device (expo-speech), especially Arabic.
- [ ] **Quick Eye** display timing at short durations (<100 ms) on low-end phones.
- [ ] **Text size** settings at 1.4× on small phones and tablets.

## 3. Unfinished parts of built features

- [ ] **Light Path** tones play on the web only (Web Audio). Add native audio with expo-audio.
- [ ] **Logic Corner** has no undo button.
- [ ] **Memory Toolkit carry-over:** `getCurrentTool()` (`src/engine/toolkit.ts`) is not yet wired in. Planned:
  - a strategy hint button in Memory Vault, Light Path and other memory games during the week after a lesson
  - a "Did you use the trick today?" question on the close screen
- [ ] **Session rotation rules** from EXERCISE-CATALOG §3.3 not yet implemented in `src/engine/session.ts`:
  - **Frustration guard:** if success stays below 60% (Keep Sharp) or 75% (Rebuild) for 2 sessions, rest the game for a week and drop 2 levels.
  - **Booster weeks** (months 11 and 35): show Pattern Path and Quick Eye more often. Today `program.ts` only shows the phase on the home screen.
  - **Hard-then-easy ordering:** in Rebuild, put the hardest game early.
- [ ] **Memory Vault:** add predict-before-recall, and an optional strategy hint.
- [ ] **Story Thread:** a "replay one line" support for Rebuild, and a "topic in one picture" question.
- [ ] **Word Finder** only knows the app's ~120 concepts. Options:
  - a bigger offline lexicon from Wiktionary via wiktextract (CC-BY-SA data)
  - an embedding-based reverse dictionary
  - an optional online mode
- [ ] **"Where were we?"** recap is keyword-based. Consider an optional on-device or online summary, with consent.
- [ ] **Eastern Arabic digits** (٠١٢٣) setting for Arabic, used in Pattern Path, Pill Box and Logic Corner.
- [ ] **Pill Box scheduling:** `pillBox` is marked `planning`, so it never hosts the intention emoji. Check whether it shows up often enough in Rebuild.
- [x] **FSRS scheduling** through learn-sdk (ADR 0009).

## 4. New exercises (from docs/EXERCISE-CATALOG.md)

- **Second wave:** Find & Tick, Sort Switch, Arrow Wise, Keep Track, Market Run, Tower Tidy.
- **Third wave:** Missing Tile (matrices, which need our own generator because RAVEN is GPL), Turn It, Finish the Line, Word Basket, Plan My Day, Walk Home.
- **Planned earlier:** Focus Lanes (the APT ladder), Melody Echo, Language Switch.
- **Do not build:** a classic n-back (weak evidence).
- **Adding a game:** create `src/games/<Name>.tsx`, `src/i18n/games/<id>.ts`, an entry in `src/games/catalog.ts` and `registry.tsx`, and names in the base i18n files (`games.<id>` / `games.<id>Desc`). Test it at `/dev/<id>`.

## 5. Bigger features

- [ ] **Family buddy.** This needs a backend. Covers weekly summaries, a "did today's session" ping and opt-in sharing. Today it's only the share sheet. A one-tap family video call could use the Jitsi Meet React Native SDK (Apache-2.0).
- [ ] **Monthly progress check-in.** Use validated tasks via m2c2kit (Apache-2.0) in a WebView. Report training progress, never a diagnosis.
- [ ] **Real-life reminders** (prospective memory):
  - prompt the user to *create* reminders (ApplTree finding)
  - "anything for your pocket?" check-ins
  - medication reminders (MedTimer, MIT, as reference)
- [ ] **PWA offline support.** There is no service worker yet; generate one with Workbox after `expo export`. Be careful with caching on updates.
- [ ] **Backup and export of progress.** Data is local only (AsyncStorage/localStorage per device), and changing phones loses it.
- [ ] **Better picture set.** Replace emoji with a normed set, e.g. MultiPic (confirm the licence) or Tawasol symbols for Arabic (CC BY-SA).
- [ ] **Optional family-photos mode.** This was deferred because content is generic for now.

## 6. Reference docs

- `docs/RESEARCH-AND-DESIGN.md`: evidence and product design.
- `docs/EXERCISE-CATALOG.md`: 18 exercise designs, build order and rotation rules.
- `docs/OPEN-SOURCE-LANDSCAPE.md`: about 200 open-source projects, licences, puzzle engines and gaps.
- `README.md`: how to run, architecture, development harness.
