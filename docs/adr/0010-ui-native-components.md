# 0010. Draw controls with ui/native

- Status: Accepted
- Date: 2026-11-27

## Context
Remindable had its own large buttons, errorless multiple choice, text scaling and RTL helpers. `@hussmartinez/ui/native` (sdk-core ADR 0069, experimental) now provides the same patterns, built from Remindable's:
- 64 dp `Button` variants with a `hint` tone and no danger variant;
- `ChoiceList` with errorless feedback and screen-reader labels;
- `Text` with a text scale;
- `Dir`, `NoFlip` and `announce`;
- `createNativeTheme`.

## Decision
- **Theme:** Remindable's palette is a `createNativeTheme` theme (`src/lib/theme.ts`), given to `NativeUiProvider` at the root with the user's text-size setting. Interface direction comes from ui's `Dir`.
- **Components:**
  - `Txt`, `BigButton`, `Dir` and `NoFlip` keep their names and props, but render ui's `Text`, `Button` (large), `Dir` and `NoFlip`.
  - `Choices` renders ui's `ChoiceList`. Answers are radio buttons, screen readers hear "correct answer" or "your answer", and the result is announced.
- **Contrast:** hint and success text use darker shades (#6b4f94, #236b40), so every text pair passes WCAG 2.2 AA at body size. Before, they were 4.49:1 and 4.34:1.
- **Remindable-only parts:** the amber highlight, the `huge` text size, `SpeakButton`, `Card`, `Screen`, `Row` and `Emoji` stay in the app, because ui has no equivalent.

## Consequences
- **Upstream fixes:** accessibility and theming fixes now come from ui. Problems are reported to the SDK family reviewer.
- **Native peer:** `react-native-svg` is now a dependency, for ui's icons.
- **Experimental entry:** `ui/native` stays experimental until a person checks it with VoiceOver and TalkBack on a device. Remindable is the app to do that check in (docs/NEXT-STEPS.md).
- **Web warnings:** on the web, ui's `Icon` passes native-only accessibility props to the DOM, which React warns about in development. This is reported to the family and harmless in production.
