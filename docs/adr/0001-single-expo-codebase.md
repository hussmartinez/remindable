# 0001. One Expo codebase for iOS, Android and the web PWA

- Status: Accepted
- Date: 2026-10-07

## Context
The users are older adults and people with brain injuries. They use iPhones, Android phones and tablets, and some only use a browser. We have no budget for separate native and web apps.

## Decision
Use Expo (SDK 57) with Expo Router and TypeScript. The web build comes from `react-native-web` and is installable as a PWA (`public/manifest.json`). Native configuration lives in `app.json` and config plugins; `ios/` and `android/` are generated and never edited.

## Consequences
- One code path for every platform. Platform differences are handled in a few places (e.g. `src/lib/confirm.ts`, Web Audio tones in Light Path).
- Native-only modules (speech recognition) need a development build; Expo Go is not enough (see ADR 0007).
- The PWA has no service worker yet, so it is not usable offline on the web.
