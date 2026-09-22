# Ease Disease — Project Context Handoff
**Date:** 2026-09-22

## What this is

An Angular v22 standalone-component PWA: a single scrollytelling homepage for
**Ease Disease**, a digestion-first functional-medicine practice. The whole
site so far is effectively one route (`Home`) built as a sequence of full-bleed
`<section class="scene">` blocks, each tied to a shared full-viewport
background-color "canvas" that crossfades as you scroll (`CanvasStoryService`
+ `appCanvasStop` directive). Visual language: warm ivory/parchment canvas,
oxblood + terracotta + honey accents, display serif for headings, mono for
eyebrows/prices, no dark-mode inversion panels — "seriousness" is carried by
color choice (oxblood), not by switching to a dark background.

Stack: Angular 22, standalone components + signals only (no NgModules, no
`ngClass`/`ngStyle`, no `CommonModule` import — see `CLAUDE.md` for the full
list of house rules). `OnPush` and `standalone: true` are both defaults in
this Angular version and must **not** be set explicitly.

Run: `npm start` (`ng serve`, defaults to `localhost:4300` in this repo's
usage so far). Build: `npm run build` / `npx ng build`.

## Live vs. gated sections

`src/app/features/home/home.ts` has a single flag:

```ts
protected readonly showRemainingSections = false;
```

Sections **currently live** (in DOM order, in `home.html`):
1. **Hero** — headline, lede, "Find your source" anchor link, gut illustration (`app-gut-hub`), inline CTA pill (now hidden <900px, see below).
2. **The Hook** (`#hook`) — pinned scrollytelling track, 4 cards, horizontal-drag on desktop (≥900px) / crossfade-in-place on mobile. Ends in a word-by-word-filling closing quote (`.hook-close`).
3. **Root Map** (`app-root-map`, own component) — interactive symptom → condition → root-cause trace map. See dedicated section below; this was the majority of the just-finished work.
4. **Programme** (`.programme`, new this session) — "Step 1: one-time consultation" promo section with a CTA and a details card (price, objective, what's covered, closing quote). Plain inline section in `home.html`/`home.scss`, not a component.

Sections **still gated behind `showRemainingSections`** (present in the DOM/CSS as scaffolding only, largely unstyled — classes like `.deep-panel`, `.root-grid`, `.turn-grid`, `.compare`, `.levels-grid`, `.team-grid`, `.close-inner`, `.fine` exist in the template but have **no CSS anywhere in the codebase**, confirmed by grep):
- **Descent** — root-cause categories grid (`rootCauses` data already exists in `home.ts`, now visually superseded by the Root Map component but not deleted).
- **Turn** — conventional vs. root-cause comparison list.
- **Levels** — pricing tiers (`levels` data in `home.ts`).
- **Team** — team bios (`team` data in `home.ts`).
- **Close** — final booking CTA (`#book` anchor target — `bookConsultation()` scrolls here already, even though the section is currently hidden; this is intentionally still wired up for when the section goes live).

These are next up for redesign but were explicitly out of scope this session.

## The Root Map component — architecture (the bulk of recent work)

`src/app/shared/components/root-map/root-map.ts` — a single-file standalone
component (template + styles inline). This is an interactive symptom →
condition → root-cause trace diagram with scroll-driven narration on the left
and the diagram itself on the right (desktop) / below the narration (mobile).

### Data model
- `SYMPTOMS` (7), `CONDITIONS` (5), `ROOTS` (4, matches `home.ts`'s `rootCauses`).
- `SYMPTOM_TO_CONDITION`: **one condition per symptom** (deliberately simplified from an earlier 2-per-symptom mapping — user asked to "complicate the roots a bit less" since too many crossing lines read as noisy).
- `CONDITION_TO_ROOT`: intentionally multi-mapping — this is the "convergence" point the whole map exists to demonstrate (different symptoms/conditions often trace to the same root).
- `EXAMPLE_TRACE = new Set(['bloat', 'skin'])` — the auto-highlighted example trace shown at a specific desktop narration beat.
- Links carry a `kind: 'sr' | 'rt'` tag (symptom→root layer vs root→... — this was the fix for a real bug, see below).

### Beat/progress model
- `BEAT_COUNT = 6`: beat 0 = heading card, 1–4 = narration cards, 5 = closing "now trace your own" card.
- Progress is computed **once**, continuously, across the combined bounding rect of the narration container + the closing card — deliberately *not* per-card `getBoundingClientRect()` testing, because a shorter-than-expected card could let a fast scroll skip a beat threshold entirely.
- `isDesktop` signal (`window.innerWidth >= 900`) is recomputed every scroll frame and gates two different reveal strategies (see below).

### Desktop vs. mobile reveal — this diverged a lot before landing
- **Desktop**: `showConditions`/`showRoots` are synced to `activeStep` (the beat index) — layers reveal in lockstep with the narration.
- **Mobile**: layers reveal based on the **map element's own scroll position**, independent of the narration beats (`updateMobileMapReveal()`, thresholds 0.3 / 0.65 against the map's own `getBoundingClientRect()`). This was a late, deliberate decoupling — earlier attempts tried to keep mobile synced to the same beat system as desktop and repeatedly produced overlap/overflow bugs (see "Bugs fixed" below).

### Layout mechanics
- `.root-map-grid` is a 2-column CSS Grid on desktop (`≥900px`), plain block flow on mobile.
- `.root-map-scroll-group` is a wrapper around narration + map: `display: block` on mobile (a real box, so the non-sticky mobile map has a sane containing block), `display: contents` on desktop (dissolves itself so its children — narration and map — become **direct grid items again**, flattening back to the structure the sticky-map behavior actually depends on).
- **Load-bearing gotcha, worth remembering for any future layout change here**: a `position: sticky` element's "room to stick" comes from its *immediate DOM parent's own rendered height*, not from whatever CSS Grid track it's nested inside several levels down. An extra wrapper `<div>` with no explicit height around the sticky map will shrink-wrap to the sticky child's own height instead of inheriting the full grid-area span — this silently breaks "sticky releases too early" in a way that's easy to reintroduce by accident when restructuring this template. `display: contents` is the fix pattern used here specifically to dodge that footgun on desktop while still getting a real box on mobile.
- On mobile, the map is **not sticky and has no fixed/height constraint at all** — this was the final, deliberate fix after three iterative attempts at a sticky-with-background mobile map kept overlapping/garbling the narration text. Overflow is now structurally impossible since there's no height budget to exceed; it just sits in normal document flow between the last narration card and the closing card.
- Desktop closing card (`.root-map-step--last`) has `min-height: 120vh` so its CTA content settles at true vertical center while the sticky map (right column) is still in view — this was tuned up from an initial 90vh per user feedback ("let it scroll a bit more so it goes to center").

### SVG link rendering
- `pathLength="1"` on every `<path>`, `stroke-dasharray: 1; stroke-dashoffset: 1` as the default "not drawn" state, `.visible { stroke-dashoffset: 0 }` triggers the draw-in animation regardless of each path's actual pixel length.
- `.visible` (layer reveal — gated by `showConditions()`/`showRoots()` via the `kind` field) and `.lit` (active-trace highlight — brighter oxblood/terracotta stroke, layered independently) are separate CSS states on the same path. **This distinction is the fix for the main bug of this session** — see below.

### Bugs fixed this session (worth knowing if something regresses)
1. **Connecting lines never appeared except during an active trace.** Root cause: `.root-map-links path { opacity: 0 }` by default, only `.lit` set `opacity: 1`. There was no always-on "this layer is revealed" state at all. Fixed by adding the `kind` field and a `.visible` class (dash-offset based, not opacity-based) so layers actually appear as you scroll, independent of whether anything is actively "lit"/highlighted.
2. **"Reveal happens all at once at the very end of the scroll" bug.** Root cause: step detection was originally per-card `getBoundingClientRect().top` threshold testing, which could skip several thresholds in one scroll/resize frame if a card rendered shorter than assumed. Fixed by switching to one continuous progress value across the whole combined-container bounding rect, divided evenly by `BEAT_COUNT`.
3. **Sticky map disappearing entirely once scrolled to ~100%** (happened twice, same root cause both times, during two different restructures). Caused by wrapping the sticky map in an extra non-full-height `<div>`. Fixed via the `display: contents` pattern described above. If a future refactor reintroduces an intermediate wrapper around `.root-map-wrap` on desktop without also either giving it explicit full-span height or making it `display: contents`, expect this exact bug to come back.
4. **Mobile map overlapping/garbling narration text** — three iterations before landing on the fix. Attempt 1 (background + taller sticky box) still overflowed and looked like an unwanted opaque card. Attempt 2 (this repo's actual fix) abandoned sticky-on-mobile entirely in favor of plain block flow. Attempt 3 restored the progressive scroll-driven reveal effect the user still wanted, without reverting the non-sticky fix, by driving reveal off the map's own position instead of the narration beats.

### Copy/content details worth knowing
- Disclaimer text (appears twice — once as `.root-map-caption` below the map, desktop-only, 9px muted text; once as `.root-map-fine` at the bottom of the closing card): *"\* This map shows common patterns, not a diagnosis. Please speak to our qualified practitioner for your diagnosis."* (Note: "our" not "your" — this was an explicit correction from the user.)
- The section heading now lives **inside** `root-map.ts` itself as the first narration card (`.root-map-step--lead`), not in `home.html`/`home.scss` — it was deliberately moved out of `home.scss` (a stale comment marks this) so it scrolls as a normal card at every breakpoint rather than behaving as a sticky/backgrounded header, which the user explicitly rejected ("what is this white bg in heading").

## Hero CTA / chrome CTA parity (most recent change before this handoff)

- `src/app/features/home/home.scss`: the hero's inline "Book a consultation" pill is now `display: none` below 900px (`@media (max-width: 899px) { .hero-visual .cta-row { display: none; } }`), since the always-visible top-bar/chrome CTA (`app.html`, `revealMetaOnHover=true`) already covers that role on mobile — the inline one was redundant from first paint, not just once scrolled past (which is all `heroCtaOpacity()` otherwise handled).
- `src/app/shared/components/cta-pill/cta-pill.ts`: touch-device (`@media (hover: none)`) meta-text (price/duration) reveal changed from **always visible** to **reveal only on `:active`** (press/long-press) — parity with the desktop hover-reveal behavior, per explicit user request. Desktop `:hover`/`:focus-visible` reveal logic is unchanged. Only the chrome CTA uses `revealMetaOnHover`; the hero's own CTA never set that input and is now hidden on mobile anyway.

## New this session: the "Programme" section

Added between Root Map and the gated-sections block, live at every breakpoint,
plain inline markup in `home.html`/`home.ts`/`home.scss` (no new component —
consistent with how Turn/Levels/Team/Close are structured, just styled where
those aren't yet).

- Two-column on desktop (`.programme-grid`, ≥900px), single column on mobile.
- Left: eyebrow "How it starts", `t-display` heading, lede, and a "Book your
  first consultation" CTA pill (`app-cta-pill`, wired to the same
  `bookConsultation()` handler as everything else).
- Right: `.programme-card` — a `Step 1` tag, price (`₹499`, with a `"₹599 to
  be confirmed · 30 minutes"` note — **this figure is explicitly TBC per the
  source requirements doc, flagged to the user, not yet confirmed**), the
  stated objective, a checklist (`app-evidence-tick` bullets, data array
  `programmeIncludes` in `home.ts`) of what the consultation covers, and a
  closing quote: *"You are what you think, what you eat, and how well you
  digest it."*
- Reuses existing design tokens/patterns from `level-card.ts` (`--surface-card-light`,
  `--rule-on-light`, `--r-lg`, `--shadow-soft`) rather than inventing new ones.
- Canvas transition: `from="var(--canvas-descent-to)"` to
  `to="var(--canvas-turn-mid)"` — continues the tone where Root Map leaves off,
  drifts slightly warmer toward the (still-hidden) Turn section's ember tone.
- **Known build warning (non-blocking):** `home.scss` now exceeds its
  configured budget in `angular.json` (8 KB soft limit; currently ~9.36 KB).
  Build still succeeds, just prints a `WARNING` line. Worth revisiting the
  budget config or trimming the SCSS if this file keeps growing.

## Known outstanding items / not yet done

- The five gated sections (Descent, Turn, Levels, Team, Close) still need a
  full visual pass — currently unstyled scaffolding behind
  `showRemainingSections = false`.
- PWA icons in `public/icons/` are still the Angular CLI default placeholders
  — flagged early in the project, never actually replaced.
- `home.scss` CSS budget warning above.
- The `₹499 / ₹599 to be confirmed` price in the new Programme section needs
  a final decision from the user/business side — currently showing both
  figures with the second flagged as unconfirmed, per the literal source
  requirements text handed over this session.
- No outstanding known bugs in the Root Map or hero/CTA behavior as of the
  last clean build — but the Programme section and hero-CTA/meta-reveal
  changes have not yet been visually confirmed by the user on localhost
  (functionally verified only via `ng build` succeeding).

## Reference files dropped in repo root (not part of the app, design references)

- `root-map.html` — a standalone HTML/CSS/JS reference implementation of the
  desired Root Map scroll/reveal behavior, supplied by the user mid-session
  as the ground truth for "make it work exactly like this." Worth checking
  against if the Root Map's scroll behavior ever needs re-deriving.
- `ease-hero.html`, `ease-oxblood.html` — earlier design reference/mockup
  files (predate this session, not modified here).
- `best-practices.md`, `AGENTS.md` — supplementary instructions/context
  files alongside `CLAUDE.md`.
