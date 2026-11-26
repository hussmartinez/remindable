# Browser smoke tests

These are Playwright scripts that drive the web build in headless Chromium and save screenshots. They are not part of `npm test`. Use them to check flows and RTL layout by eye.

## Setup
- Install a Chromium, e.g. `npx playwright install chromium`.
- Set `CHROMIUM_PATH` to its executable.
- Start the app: `npx expo start --web --port 8091`. Set `APP_URL` if it runs elsewhere.

## Scripts
- `shot.mjs <path> <out.png> [label|#index|wait:ms ...]`: open a route, tap buttons by aria-label or index, take a screenshot, and print the visible buttons and console errors.
  - Example: `node scripts/e2e/shot.mjs "/dev/pillBox?lang=ar&profile=rebuild" pb.png`
- `session.mjs <uiLangName> <profileIdx 0|1> <outDir> <sessions> [extraLangNames]`: go through onboarding, then run N daily sessions using the dev-only ⏭ button, screenshotting the first screen of every step.
  - Example: `node scripts/e2e/session.mjs "العربية" 1 out 3 "Español"`
- `run.mjs <uiLangName> <profileIdx> <outDir> [extraLangNames]`: the original full-session bot from v1. It plays the v1 games by tapping; the newer games need ⏭.
- `sheet.py <out.png> <images...>`: makes a contact sheet of screenshots (needs Pillow).
