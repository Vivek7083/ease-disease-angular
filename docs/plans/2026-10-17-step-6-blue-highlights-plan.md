# Step 6 plan: blue highlights (#00AEEF)

Source: "Ease Dis-ease website changes" guide, Step 6. Status: **built and verified, awaiting approval to commit.**

Decisions made (user): text selection becomes blue too, and the Events and Carol/Deepa heading highlights become blue, so highlight and select are consistent across pages. Implemented with one token `--highlight-blue: #00AEEF` in `colors.css`, used in `styles.scss` (`::selection`), `home.scss`, `events.scss`, `carol-profile.scss`, `deepa-profile.scss` and `display-block.ts` (the "Optimum Health" style highlight). Verified in Chromium: all four pages resolve to `rgb(0, 174, 239)`; the hook phrase fill reaches blue at `--fill: 1`; `::selection` is blue; type-check clean.

## Goal

Two home-page highlights change from honey yellow to `#00AEEF`:

1. **"listen"** in the hero headline ("It's time to listen"). Keeps its half-height highlighter style.
2. **"You are what you think, what you eat, and how well you digest it."** The whole phrase sits on a solid blue band.

Every other yellow touch (dots, decorations, root-map selected state, events and founders heading underlines) stays unchanged.

## What the code actually has (verified, not taken from the guide's selectors)

| Guide selector | Real code | Where |
|---|---|---|
| `.hero-headline-sub .mark` | `.hero-headline .mark` (the span sits inside `.hero-headline-sub`, which sits inside the headline) | `home.scss:118-126`, `home.html:10` |
| `.hook-close-word` | same class, but it is a **scroll-driven fill**: each word's background is `color-mix(honey calc(var(--fill) * 100%), transparent)`, with `--fill` going 0 to 1 as it scrolls | `home.scss:883-888`, `home.html:41` |

Consequences:

- The guide's `!important` overrides are not needed. Edit the two declarations in place.
- The second phrase must keep the `--fill` sweep, only with blue instead of honey. A flat `background-color: #00AEEF` would make the band visible from the start and lose the scroll effect.

## Changes (2 targeted edits, `home.scss` only)

1. `.hero-headline .mark`: in the `linear-gradient(transparent 52%, ...)` replace `color-mix(in oklab, var(--honey) 85%, transparent)` with `#00AEEF`. Update the "Yellow highlighter" comment.
2. `.hook-close-word`: replace `color-mix(in oklab, var(--honey) calc(var(--fill) * 100%), transparent)` with `color-mix(in oklab, #00AEEF calc(var(--fill) * 100%), transparent)`. Update the comment above it, which says "honey (yellow) ... identical to the browser's ::selection colour".

Both are same-size replacements, so `home.scss` stays under its 32kB style budget.

## Decisions to confirm before building

- **Text colour on the blue band:** Step 5 made text `#000`. Black on `#00AEEF` is about 8.6:1 contrast, which passes WCAG AA, so no text colour change is planned.
- **Text selection colour:** the code comment says the old fill was "identical to the browser's ::selection colour". The plan leaves `::selection` yellow, since the guide says other yellow stays. Say so if it should become blue too.
- **Other pages:** the Events and Carol/Deepa hero underlines use the same honey swipe. The guide scopes this step to the home page, so they stay yellow.

## Verification (after building)

1. `npx tsc --noEmit -p tsconfig.app.json` is clean.
2. Playwright (Chromium, scratch folder, not the project): on `/` at 1280 and 375 wide, read the computed `background-image` of `.hero-headline .mark` and the computed `background-color` of `.hook-close-word` at `--fill: 1`. Both must resolve to `rgb(0, 174, 239)`.
3. Scroll the hook section and confirm the band fills word by word.
4. Screenshot the hero and the hook phrase for a visual check.
5. Confirm no other `honey` use changed: `git diff` should show exactly the two declarations and two comments.

## Commit

After approval: one commit with a one-line message, e.g. `Blue #00AEEF highlights for "listen" and the hook phrase`.

## Remaining steps (from the guide)

7 move "Symptoms and conditions" up, 8 philosophy as alternating rows, 9 new palette, 10 E.A.S.E timeline, 11 conditions map spacing, 12 conditions tree map, 13 testimonials below programmes, 14 remove founders billboard, 15 navy expert cards, 16 hero title and subtitle, 17 philosophy intro, 18 em dashes to hyphens, 19 "Optimum Health." pop, 20 remove vine divider, 21 booking form, 22-28 new section wording and the "E.A.S.E. Root Cause Assessment" name.

Steps 1 to 5 are done: ivory, solid background, caps logo, bigger logo, black text. The Mac wordmark spacing is on hold for the user's feedback.
