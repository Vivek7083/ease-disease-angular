# Ease Disease: Context Handoff, Conditions section (root map rework)

**Date:** 2026-10-02
**Builds on:** `context-section-results-2026-10-02.md`, `context-2026-10-02.md` (design system, Hook/Treat mechanics, working style) and `project-context-2026-09-22.md` (original Root Map internals, Programme). Read those first. This doc covers only the **Conditions / root map rework** done after them, and what is left.

## What was built

The old Root Map (symptom → condition → four roots) was reworked into the PRD's "Symptoms and conditions we treat at the root" section. It is still one section (`#root-map`, component `app-root-map`), placed after Results and before Programme. It now has three parts:

1. **The map** (3 layers, curved branching): 7 condition *families* → 5 *mechanisms* → **one root: "Minerals & vitamin deficiencies"**.
2. **Notes**: 16 pinned "sticky notes", one per PRD condition group (15 groups plus "Other conditions we treat"), in the PRD's own wording and order.
3. **The fact block**: a closing beat that states the root and leads to booking.

Live section order: Hero, Hook, Treat, Results, **Conditions/Root Map**, Programme. Descent, Turn, Levels, Team and Close are still gated behind `showRemainingSections = false`.

### Files
- `src/app/shared/components/root-map/root-map.ts`: **rewritten.** One shared map `<ng-template #mapTpl>` rendered by either layout. Data (families, mechanisms, root, mappings) is at the top of the file. The old desktop narration column, the beat system and the sticky grid are gone.
- `src/app/shared/components/conditions-board/conditions-data.ts`: the 16 notes (`NOTES`), the `ConditionNote` type, and `PREVIEW_COUNT` / `SHOW_ALL_MAX`. Each note has a `familyId` matching a family node on the map.
- `src/app/shared/components/conditions-board/condition-note.ts`: `app-condition-note`, the single note card used everywhere (inputs `note`, `open`, `tilt`, `compact`; output `toggled`). Open/closed state lives with the parent so only one note is open at a time.
- `src/app/shared/components/conditions-board/conditions-board.ts`: the **mobile** column of notes (first 8, then a "See 8 more conditions" button).
- `src/app/core/directives/scroll-reveal.ts`: added an opt-in `revealRepeat` input. The element hides again when it scrolls out and re-reveals on the way back. Default behaviour is unchanged for every other section.

## The map

- **Families (top, 7):** Gut & digestion, Immune/thyroid/joints, Skin, Blood sugar & heart, Hormones & women's health, Fertility & motherhood, Brain/sleep/mood. Listed in this order so connections stay short.
- **Mechanisms (middle, 5):** Weak digestion, Inflammation, Blood-sugar swings, Hormonal signalling, Stress & nervous system. No mechanism takes more than 2 families (this fixed the "many branches into hormonal signalling" complaint).
- **Root (bottom, 1):** `deficiency`. Every mechanism links to it.
- Links keep the original curved bezier look (`layout()`), drawn with `pathLength=1`/dash-offset, with the `.visible` (layer revealed) vs `.lit` (traced) split from the original. Tapping a family node traces it; tapping again clears it. There is no "Clear" button any more.
- **History, so it is not repeated:** an attempt to route mobile connectors along rigid side rails with the middle layer hidden was rejected by the user ("the non-linear structure of the branches is gone"). It was reverted. Keep the curved organic branching.
- All mapping and labels are **draft** and illustrative, for founder/clinical review.

## Mobile (below 900px): built first, user-approved direction

Plain normal flow, no pin (a sticky mobile map overlapped text three times in the earlier rounds, so do not reintroduce one). Order: heading + one-line intro → map (layers reveal from the map's own scroll position, via `updateMobileMapReveal`, thresholds 0.3 / 0.65, both directions) → `app-conditions-board` → fact block.

Notes: single column, staggered left/right, tilted about 1°, pinned with a dot, scroll-revealed with `revealRepeat` (reverse scroll works). Collapsed they show the group name, a family caption and a one-line preview ("Hot flashes · Night sweats · Poor sleep +3 more"). Notes with 4 or fewer items show everything and are not tappable. Tapping opens the full list as chips, one at a time. "See 8 more conditions" reveals the remaining 8; it then becomes "Show fewer conditions".

## Large screens (900px and up)

- `.rm-pin` (height `DESKTOP_PIN_VH = 290`vh, so 190vh of scroll while pinned, under the project's 200vh pin rule) holds one sticky `.rm-viewport`: centred heading, then a 3-column stage (left notes | map | right notes).
- The map's layers draw in as the pin approaches (`deskStage`: 1 at top < 55% vh, 2 at top < 20% vh), so the full map is visible from the start of the pin.
- **6 notes** (`PINNED_NOTE_COUNT`) arrive one by one across the pin (`NOTES_START = 0.08`, `NOTES_STEP = 0.14` of pin progress), 3 per side (even indices left, odd right). They stay once shown, and reverse on scroll-up. They use the **compact** note variant so three fit a 720px-tall laptop.
- Each arriving note lights its **family** on the map and the path down to the root (`focusSet`). If the reader taps a family, their selection overrides it. The "dim everything else" `.focus` class is only applied for the reader's own selection, not the auto-trace.
- Below the pin: "See 10 more conditions" opens the rest as a 3-column grid of the same notes (fade-up, `revealRepeat`). It collapses again with "Show fewer conditions".
- Reduced motion: all 6 pinned notes show immediately.
- The map element is re-created when the layout flips mobile/desktop, so a `ResizeObserver` is re-attached in `observeMap()`. `isDesktop` is initialised from `window.innerWidth` to avoid a mobile flash on desktop load.

## The fact block (all breakpoints)

Replaced the old "Now trace your own" card. Centred: eyebrow "The common thread", heading "Every path leads to the same root.", then the fact **"Minerals & vitamin deficiencies"** set exactly like the hero's highlighted sub-line: `--font-display`, weight 300, size `calc(clamp(2.3rem, 1.6rem + 3vw, 3.5rem) - 3px)`, ink colour, the blue highlighter band on "Minerals" and on "vitamin deficiencies", **no highlight on the "&"**. (The user explicitly rejected an oxblood pill for this.) Then a one-line copy, the `app-cta-pill` "Find my root in a consultation" (emits `bookRequested`), and the disclaimer. Each piece uses `appScrollReveal` with staggered delays and `revealRepeat`.

## Verified

- `npx ng build --configuration production` passes (only the existing `home.scss` budget warning, about 21 kB against the 16 kB warning limit).
- Playwright screenshots at 390px (mobile), 1440×900 and 1280×720 (desktop), including scrolling through the pin, opening the "see more" grid, and the fact block. No horizontal overflow on mobile. Reverse reveal on notes was checked programmatically.
- **Follow-up checks (later the same day):**
  - **axe-core (WCAG 2 A/AA + best-practice), scoped to `#root-map`:** 0 violations at 390px and 1440px in every state (pin start with notes hidden, all 6 notes shown, a note opened, "see more" grid + fact block, a family selected). The one remaining "incomplete" is axe being unable to resolve contrast over the page's gradient canvas (layer labels, disclaimer); computed by hand, `--text-quiet-light` on parchment is about 6.5:1.
  - **Fixed from that run:** the lit family pill (ivory on terracotta) was about 3.7:1. It is now terracotta mixed 72% toward oxblood (`--lit-family`). Also the auto-trace on large screens no longer dims the rest of the map (`.focus` now applies only to the reader's own selection), per "map completely visible".
  - **Keyboard:** Tab never lands in a not-yet-shown pinned note (they are `inert`).
  - **Breakpoints 768 / 899 / 900 / 1024 / 1100:** found and fixed a real bug. At 900-1199px the side columns squeezed to 72-172px and notes overflowed the pinned viewport (13px horizontal overflow at 900). The stage now breaks out of the gutters, the map narrows to 440px and pills tighten in that range (media query in `root-map.ts`). Verified: no horizontal overflow, note columns inside the viewport. 768 and 899 use the mobile layout, 900+ the pinned stage.
- **Still not verified:** real devices, a real screen reader (axe and the inert check are not a substitute), and widths above 1920px.

## Working-style / environment notes from this session

- **Dev server for the phone:** `npx ng serve --host 0.0.0.0 --port 4301` (a second server, because the user's own is on 4300). The phone URL was `http://192.168.1.34:4301` (Wi-Fi adapter; ignore the 172.30.x virtual adapter). Windows Firewall may need an inbound rule for the port. Never kill all node processes.
- **Playwright loop:** `npm install --no-save playwright`, throwaway script in the repo root, read the screenshots, then always `rm` the script and PNGs, `npm uninstall playwright`, and check `git status`. Let `.reveal` and layer transitions settle (scroll through, wait about 1.5 s) before screenshotting. Hide the fixed header/CTA chrome when clipping.
- **Editing files:** `root-map.ts` and others use **CRLF** line endings. Bash heredocs and `sed` mangle backslashes and large blocks. Reliable pattern: write a small Node script that reads the file, converts to LF, applies string replacements with a "missing anchor" check, and writes back as CRLF. Or use the Edit/Write tools. A Node edit script must not contain literal backslash escapes passed through the shell.
- **The user iterates in small, contradicting steps** and will reject a "cleaner" idea that loses something they liked (rails vs organic curves; pill vs underlined text). Prefer the smallest change that addresses the stated complaint, and keep comments recording why.
- **Git:** nothing from this work is committed. Some files were already staged by something other than this session (`git status` showed `A`/`AM`). Check before committing.

## Known issues / open items

1. **Connector crossings (minor):** on mobile and the desktop map, a few curves still pass behind a pill in a lower row (e.g. tracing Hormones runs behind "Brain, sleep & mood"). Candidate fix, offered but not yet chosen: shorten the family labels so the top layer fits in two rows.
2. **Pinned notes are hormone-heavy:** the first 6 in PRD order include three Hormones-family notes. Reordering is one array change in `conditions-data.ts`.
3. **Mobile closing:** the old "Now trace your own" hint text is gone; the map's tap-to-trace is now undiscoverable except by the one-time simulated tap hint on the first pill.
4. **Heading wording "treat" vs "support"** (PRD legal flag), and the heavy conditions (autoimmune, MS, neurological, Alzheimer's etc.) which sit in the "see more" half on both mobile and desktop. Needs Dr. Akshai and a legal advisor. Pregnancy/postpartum need OB-GYN coordination wording (PRD flag).
5. **Draft copy needing founder sign-off:** the section intro, the fact-block copy ("When the body runs short of what it needs, it can show up differently in everyone. A consultation finds out which ones are yours."), the mechanism names, and the 7 family groupings.
6. **PRD handwriting items 4 and 5** ("PCOS / PMOS", "Fertility (both partners)") still need confirming.
7. **Magnesium / vitamin D3** are still listed in the Programme card (`home.ts`, around line 940) although the PRD says to remove them from the package section.
8. **Carried over from earlier handoffs:** the Results testimonial is an invented placeholder (launch blocker, see `need-review/testimonial-placeholder.md`); Programme price ₹499 vs the PRD's 1,500–2,500 (unconfirmed); `home.scss` over its CSS budget; PWA icons are still CLI placeholders; Descent/Turn/Levels/Team/Close still unstyled and gated; no "Take the Digestion Quiz" flow exists (the hero's quiz link just anchors to `#root-map`).
9. The user said they will resolve all PRD/build inconsistencies **at the end, one by one**. Do not start fixing them unprompted.

## Next up (PRD order)

After Conditions/Root Map and Programme (Packages): **Community + testimonials**, **Team / Expert profiles** (Carol, Deepa, Dr. Akshai Kolagani; bio still pending), **FAQ** (11 questions in the PRD, several still `[Template: confirm]`), **final banner**, **footer**, then the booking/checkout/payment flow (Razorpay, per memory). Order of work stays: **mobile first, then large screens**, compact on desktop.
