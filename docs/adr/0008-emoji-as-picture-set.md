# 0008. Use emoji (Unicode ≤ 11) as the picture set

- Status: Accepted
- Date: 2026-10-07

## Context
Picture naming, odd-one-out and everyday scripts need hundreds of images. Normed sets are better but have licence questions: MultiPic's image licence is unconfirmed, and ARASAAC is non-commercial.

## Decision
Use system emoji, rendered offline with no licence needed. Use only emoji from Unicode 11 or earlier, so older Android phones don't show empty boxes.

## Consequences
- Zero asset weight and works everywhere.
- Emoji look different on each platform, and colour-based tags must be checked on real devices.
- Once its licence is cleared, a normed picture set should replace emoji for naming tasks.
