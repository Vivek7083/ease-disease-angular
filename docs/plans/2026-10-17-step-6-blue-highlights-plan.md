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

## Step 7 status: move the conditions section up (built, awaiting approval to commit)

Template-only change in `home.html`: the `#root-map` section and the `curtain` divider that follows it now sit between the inter-quote and `#hook`. The `vine` divider stays where it was (between Testimonials and Programmes), so every junction keeps exactly one divider. The guide describes the divider as sitting above the section; in this codebase the divider next to the section is the curtain below it, so that is the one that moved with it. Verified in Chromium at 1280 and 375 wide: order is hero, inter-quote, root-map, curtain, hook, dots, treat, sprout, results, testimonials, vine, programme, wave, experts, events; no console errors; type-check clean. No CSS changed. Note `.hook` still has zero top padding (it was written for the hero handing straight into it), but the screenshot shows the curtain divider and heading spacing looking fine.

## Step 8 status: "Our philosophy" as alternating rows (built, awaiting approval to commit)

New component `shared/components/philosophy/philosophy.ts` (`app-philosophy`) holds the guide's markup and CSS (steps 2 and 3 of the guide merged: 340px pictures from the start), so `home.scss` stays under its 32kB budget. `home.html`: the `#hook` section's interior (pinned desktop deck, mobile carousel) is replaced by `<app-philosophy [points]="hookPoints" />`. Differences from the guide's snippet, on purpose: rows loop over the existing `hookPoints` data (text, images and alt text stay exactly as they were, including the em dashes, which Step 18 handles); images use `NgOptimizedImage` (`fill`) per the project rules; the reveal uses `[appScrollReveal]="0"` like the rest of the site; fonts and the divider colour use the design tokens. The old carousel/deck code in `home.ts`, `home.scss` and the unused `hookCopy` template in `home.html` is left in place as dead code, as the guide suggests, for a later cleanup. Verified in Chromium at 1280 and 375 wide: image on the right in rows 1 and 3, left in rows 2 and 4, 340px wide; stacked with 240px images on mobile; all four images load; every row reveals; text is black; no console errors; type-check clean.

Follow-up (user request): the reveal now plays in reverse on scroll-up (`[revealRepeat]="true"` on each row, plus a component override that keeps the 28px rise; the global `.reveal-repeat` is fade-only). A row rewinds only when it leaves through the bottom edge (the directive's existing rule, which avoids flicker at the top edge). Verified with incremental scrolling in Chromium on desktop and mobile. Known edge: after a very fast jump (scrollbar drag or "back to top") rows that never cross the viewport are not rewound, so they stay shown. That is a limit of the shared directive.

## Step 9 status: new colour palette (built, awaiting approval to commit)

Done by changing the design tokens themselves instead of the guide's `!important` overrides: `colors.css` (`--oxblood #1B3B53`, `--oxblood-deep #12293B`, `--olive #1B3B53`, `--terracotta` and `--ember-a #BF3820`, `--ember-b #E06F27`, `--honey #00AEEF`, `--rule-on-dark #3A5F7D`, `--text-quiet-dark #D6E2EC`, `--surface-card-light #FFFFFF`) and `elevation.css` (navy-based shadows, new ember glow). Component edits: the hero gut-drawing moving dots keep a hard-coded honey `#f2c14e` (`gut-hub.ts`); the conditions map's lit chips, selected chips and lit links are the vivid blue with black text (`root-map.ts`); the note-pin shadow is navy (`condition-note.ts`). The guide's Step 8 border change was already in the philosophy component. Verified in Chromium (desktop and mobile; Home, Deepa, Carol, Events): a scan of every element's colours, borders, fills, strokes and shadows finds none of the old maroon, olive, honey, terracotta or old ember values except the intended moving dots; no dark text on a dark background; type-check clean; screenshots of the conditions map (lit trace), results panels, programme card, events card and footer look right. Side effects to know: `--honey` also drives the soft tints on cards and the events invite card, which are now pale blue; the fixed scroll-progress number is black and hard to read over the navy footer (a Step 5 side effect).

Follow-up (user): the deep navy is now `#213848` (was the guide's `#1B3B53`) in `--oxblood` and `--olive` and the philosophy picture border. The darker footer navy `#12293B` is unchanged, pending the user's call. A live scan finds no `#1B3B53` left. Awaiting approval to commit.

## Step 10 status: "Transform with E.A.S.E" as a timeline (built, awaiting approval to commit)

New component `shared/components/transform-timeline/transform-timeline.ts` (`app-transform-timeline`), same pattern as Step 8, so `home.scss` stays under budget. `home.html`: the `#treat` section's interior (pinned desktop panels, mobile card deck, shared templates) is replaced by `<app-transform-timeline [steps]="treatTimelineSteps" />`. `home.ts`: `treatTimelineSteps` is built from the existing `treatSteps` (title and `bodyShort`) and `treatDesktopImages` (the landscape images and alt text), so step text, images and alt text are unchanged. Removed the now-unused `NgTemplateOutlet` import. Differences from the guide's snippet, on purpose: reveal delays are staggered (`i * 160` ms) for "one after another"; images use `NgOptimizedImage`; fonts, navy dot (`--oxblood`, now `#213848`), ivory ring and warm gradient line use the design tokens. Copy decision to confirm: the guide's snippet has the eyebrow "Built with you, not just for you" and sub-text "Physically, mentally and emotionally.", while the previous page said "Built with you, not for you" and "Four steps. Every one grounded in what your body is actually telling us." The snippet's wording was used. Step 1 body keeps the em dash (Step 18 handles dashes). Verified in Chromium at 1280, 800, 375 and 320 wide: horizontal timeline on desktop (section about 919px tall, was about 4,200px), vertical line on tablet and phone, navy dots, warm-gradient line, all images load, all steps reveal, eyebrow stays on one line on phones, no horizontal overflow, no new console errors, type-check clean. The old pinned-scroll and card-deck code is left in `home.ts` and `home.scss` as dead code for a later cleanup.

## Step 11 status: conditions map spacing (built, awaiting approval to commit)

Edited in place in `shared/components/root-map/root-map.ts` (the map's styles are component-scoped), not as global `!important` overrides. Desktop: map column 580px to 650px, stage gap 32px, row gap between the three layers 52px, chip gap `14px 12px`, chips 42px tall with 20px side padding, layer label margin 14px. Mobile (under 900px): layer gap 40px, chip gap `10px 8px`, label margin 10px, chip size unchanged. One deliberate difference from the guide: the 900 to 1199px laptop override (440px map, tighter chips) is kept, because the guide's `!important` rules would force the 650px column there and squeeze the note columns. Verified in Chromium at 1440, 1280, 1024 and 375 wide: map 650px at 1280 and 1440 with side note columns 211px each (guide: about 210px), chips 42px, gaps 14px and 12px; at 1024 the map stays 440px with 260px note columns; mobile gaps 10px and 8px; no horizontal overflow, no console errors; type-check clean; screenshots at 1280 and 375 look right.

## Step 13 status: testimonials below Programmes (built, awaiting approval to commit)

Template-only change in `home.html`: the `#testimonials` block (comment plus section) now sits directly after the `#programme` section's closing tag; no dividers moved, so the vine now sits between Results and Programmes and the wave between Testimonials and Experts. Verified in Chromium at 1280 and 375 wide: order is hero, conditions map, curtain, philosophy, dots, treat, sprout, results, vine, programme, testimonials, wave, experts, events; the WhatsApp controls work in the new position (desktop sidebar switches Energy & mindset to Weight & insulin, mobile next arrow does the same); no console errors; type-check clean.

## Step 15 status: expert cards in deep navy (done)

Edited in place in `shared/components/team-card/team-card.ts` (the card's styles are component-scoped; it is only used by the home experts carousel). Card: solid `--oxblood` navy (`#213848`, not the guide's `#1B3B53`), no gradient, navy border, white name, role and "Know more about…" link, `#D6E2EC` (`--text-quiet-dark`) credential and bio, 50%-white link underline, white hover and focus states, energy dot at 35% opacity. Additions beyond the guide: the corner foliage stroke is pale blue at 18% opacity (the old navy stroke would vanish on navy), and the card's pill-style CTA uses the light variant (`ghostLight`; both home cards use the link style). Verified in Chromium on desktop and mobile for Carol: computed colours as above, no console errors, type-check clean, screenshots look right. Deepa's card was not looked at (same styles). Step 14 (remove the founders billboard banner) was skipped by the user for now.

## Step 16 status: new hero title and subtitle (built, awaiting approval to commit)

`home.html`: the hero `<h1>` now reads "Your Body Is / Speaking. / It’s Time to Listen." (`id="hero-heading"` kept for `aria-labelledby`; "Speaking." stays italic and "Listen." keeps the blue highlighter) and the lede reads "Understand the signals. Explore the root causes. Take a more informed approach to your well-being." `home.scss`: `.hero-copy` gets `padding-top` 32px on phones and 40px from 900px up. The page `<title>` and meta description in `src/index.html` were not changed (the guide calls that optional). Verified in Chromium at 1280x800, 1366x768 and 375x800: text, italic and highlight colour as specified, padding 40px/32px, the title clears the logo, the hero CTA row stays above the fold, no console errors, type-check clean, screenshots look right. On phones the hero's "Book a consultation" pill is not shown (the header "Book now" covers it); that is existing behaviour, not part of this step.

## Remaining steps (from the guide)

12 conditions tree map (DEFERRED to last by the user, needs a lot of rework; a first working version, including the 6 root causes and the "only taps highlight" behaviour, is saved in `git stash` as "step-12-tree-map (deferred to last)", restore with `git stash pop`; the six root-cause links are health claims for Deepa or Carol to review), 14 remove founders billboard, 15 navy expert cards, 16 hero title and subtitle, 17 philosophy intro, 18 em dashes to hyphens, 19 "Optimum Health." pop, 20 remove vine divider, 21 booking form, 22-28 new section wording and the "E.A.S.E. Root Cause Assessment" name.

Steps 1 to 5 are done: ivory, solid background, caps logo, bigger logo, black text. The Mac wordmark spacing is on hold for the user's feedback.
