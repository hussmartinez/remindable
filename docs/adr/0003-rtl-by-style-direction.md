# 0003. Apply RTL with the `direction` style, not `I18nManager`

- Status: Accepted
- Date: 2026-10-07

## Context
The app supports Arabic (RTL) next to Spanish and English, and a user can practise in several languages at once. Arabic content can therefore appear inside a Spanish or English interface. `I18nManager.forceRTL` flips the whole app and needs a restart.

## Decision
Set `direction` on the root view from the interface language. Wrap content in its own language with `Dir`, and wrap physical layouts (grids, maps, arrows, Quick Eye's arena) with `NoFlip` (`src/components/ui.tsx`). Series, step slots and timelines follow reading direction.

## Consequences
- Switching to Arabic is instant, and mixed-language screens are laid out correctly.
- Each new game must decide which parts follow reading order and which are physical space.
- Text direction on the web is detected per paragraph (`dir="auto"`). A Latin-class symbol at the start of an Arabic string (e.g. ⓘ or ℹ️) forces it LTR, so keep such icons in their own `Text`.
