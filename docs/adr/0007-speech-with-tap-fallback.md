# 0007. Speech recognition with a tap-based fallback everywhere

- Status: Accepted
- Date: 2026-10-24

## Context
Word-finding practice and conversation support work best when the user can speak. Offline engines (Vosk, whisper.rn) need large per-language models. The platform recognisers cover es, en and ar without bundling models.

## Decision
Use `expo-speech-recognition`, wrapped in `src/lib/speechRecognition.ts`, preferring on-device recognition where the OS supports it. Every screen that uses speech falls back to the tap flow when recognition is unavailable (Expo Go, unsupported browser, permission denied). Spoken answers are matched leniently in `src/engine/wordMatch.ts`: accents, articles, plurals and synonyms are accepted.

## Consequences
- Native builds need a development build or EAS build.
- When on-device recognition isn't available, audio may go to Apple, Google or the browser vendor. The UI states this.
- Matching lists and synonyms need native-speaker review.
