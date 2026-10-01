# Ease Disease: Context Handoff, Results section

**Date:** 2026-10-02
**Builds on:** `context-2026-10-02.md` (design system, Hook/Treat mechanics, working style) and `project-context-2026-09-22.md` (Root Map, Programme). Read those first; this doc covers only the **Results** section built after them, plus what to do next.

## What was built this session

A **Results** section ("After the work") now sits **right after Treat and before Root Map**. It maps to PRD §4 (Transformation/Results) and §5 (large client quote). Mobile was designed first, then large screens.

Live section order is now: Hero, Hook, Treat, **Results**, Root Map, Programme. Descent, Turn, Levels, Team and Close are still gated off behind `showRemainingSections = false`.

### Files
- `src/app/shared/components/results/results.ts`, `results.html`, `results.scss`: new standalone component `app-results`. It is a separate component (not inline in `Home`) because `home.scss` is already over its CSS budget (about 21kB, warning only).
- `src/app/features/home/home.html`: `<section class="scene results" id="results" appCanvasStop from="var(--canvas-results-from)" to="var(--canvas-results-to)">` wrapping `<app-results />`. The Root Map section's `from` was changed to `var(--canvas-results-to)`.
- `src/app/features/home/home.ts`: imports and registers `Results`.
- `src/styles/tokens/canvas.css`: added `--canvas-results-from` (= treat-to), `--canvas-results-to` (`color-mix(in oklab, ivory 10%, parchment)`), plus `-text` and `-body` entries. `--canvas-descent-from` now equals `--canvas-results-to`, so the crossfade chain stays continuous.
- `need-review/testimonial-placeholder.md`: pre-launch review notes (see "Open items").

### Content (component data)
- Eyebrow "After the work"; heading "What changes when the cause is found."; short intro line.
- Six outcomes (`OUTCOMES` array): Steadier energy; Better sleep; Balanced mood and hormones; Less reliance on medication; Numbers in their optimal range; Confidence in your own health. Worded as "can" or "many people", never as guarantees (the content doc says "cure" became "treat" and "find").
- One large quote card driven by a single `TESTIMONIAL` object (`quote`, `name`, `context`, `isPlaceholder`).
- **The testimonial is invented stand-in text** ("Priya Sharma", "Mumbai"), added at the user's request purely for design review. It has `isPlaceholder: true`, the card renders `data-placeholder="true"`, and a code comment says it must be replaced. See Open items.

### Design decisions (the user steered these, in order)
1. **Mobile mechanic:** light `appScrollReveal` fade-up, **no pin**. Deliberately calmer after two pinned sections (Hook, Treat).
2. **Olive green** was requested for this section. Olive (`--olive` #4A5726) was previously reserved for the Root Map's 3-layer trace, so this is its first use elsewhere. The colour notes in the earlier handoff need updating if it stays.
3. **Outcomes as leaves on a burgundy stem:** pure CSS, no SVG or images. Each point is an olive leaf: `border-radius: var(--r-xs) var(--leaf-sweep) var(--r-xs) var(--leaf-sweep)`. The twig meets the near-square top-left corner. Numerals are honey, titles ivory, body `--text-quiet-dark`.
   - **Mobile:** one vertical oxblood stem down the left (`.results-list::before`), a horizontal twig per leaf (`.results-item::before`).
   - **Desktop (>=900px):** 3x2 grid. Each row hangs from a horizontal stem, with vertical twigs down to the leaves. A left-hand trunk sits just outside the grid in the section gutter (`--trunk-offset`) and joins the two row stems into **one continuous stem**. The trunk is the first leaf's `::before` made into a transparent L (top and left borders only, `height: calc(100% + var(--row-gap) + var(--stem-w))`). Its corners must stay square: a pill radius on that tall box bows the L into an arc (this happened once).
   - Desktop leaf rows use `align-content: start`. Without it, a two-line body in one leaf pushes that leaf's title off the shared row.
4. **"Too much olive":** the testimonial card was changed to `var(--surface-deep)` (oxblood) so the leaves are the only olive in the section.
5. **Desktop was "too big and overwhelming":** the large-screen version was shrunk.
   - Smaller leaves (`--leaf-sweep: 52px`, 1.25rem titles, 0.9rem body, tighter gaps).
   - Quote card is a compact **two-column** card: attribution on the left, quote on the right at `clamp(1.15rem, 0.9rem + 0.7vw, 1.5rem)`, `max-width: 52ch`.
   - Section height at 1440px went from about 1,350px to about 820px.
   - The quote mark now hangs just before the quote's first line (grid column 1, `justify-self: end`, negative right margin). It was previously stranded at the card's left edge.

### Verified
- Production build passes (`npx ng build --configuration production`). The only warning is the existing `home.scss` budget one.
- Playwright screenshots at 390, 1024, 1440 and 1920px: no horizontal overflow.
- The user's own dev server on port 4300 is expected up (`npx ng serve --port 4300`).
- **Not verified:** real devices, the reveal animation timing, and screen-reader behaviour (`.results-num` is `aria-hidden`; the quote uses `<figure>`/`<blockquote>`/`<figcaption>`). No AXE run was done.

## Open items

1. **Launch blocker: replace the invented testimonial** with a real, consented client quote. Edit the single `TESTIMONIAL` object in `results.ts` and set `isPlaceholder: false`. Find it with `grep -r isPlaceholder src`. Full notes are in `need-review/testimonial-placeholder.md`.
2. **Clinical and legal review of the outcome wording**, especially "Less reliance on medication: with your doctor, many people can step down what they once thought was for life" and "Numbers in their optimal range". The PRD itself flags treatment-claim risk under Indian advertising rules.
3. **Founder sign-off on copy I wrote** (not in the PRD): the heading, eyebrow, intro line and per-outcome one-liners.
4. Olive's first use outside Root Map: update the earlier handoff's colour notes if it stays.
5. Still pending from the founders (unchanged): pricing, programme scope, format, privacy policy, refund policy, Dr. Akshai's bio. The Programme price `₹499 / ₹599 to be confirmed` is also unconfirmed.
6. PWA icons in `public/icons/` are still CLI placeholders.

## Next up (PRD order)

- **§6 Conditions We Treat** is next. The PRD says "oneliner, like Parsley Health" and "diseases + images/videos where apt". The content doc lists about 12 groups plus "other conditions". Its own flag says "Conditions we support" is the safer heading than "Conditions we treat", and heavy conditions (diabetes, MS, Parkinson's, Alzheimer's, autism, ADHD) carry legal and credibility risk. Pregnancy and postpartum need OB-GYN coordination wording. Items 4 and 5 of the handwritten list ("PCOS / PMOS", "Fertility (both partners)") were hard to read and need checking.
- Then Root Cause (already built as Root Map), Packages, Community, Team, FAQ, Footer and the booking and checkout flow, per the PRD.
- Order of work: **mobile first, then large screens**, as the user has asked each time.

## Reference and working-style notes

- **Parsley Health (https://www.parsleyhealth.com)** is saved in memory as the presentation reference: clean, compact, uncluttered, not overwhelming. The PRD also lists it under References. Borrow structure and pacing only, not branding or copy. The suggested first step for Conditions We Treat is to fetch the site and write up how they structure that section (not yet done).
- Memory also holds the Razorpay Magic Checkout scrollytelling reference (a design reference, not a payment provider note).
- **The user iterates in small, concrete, sometimes contradicting steps** (olive added, then "too much olive"; leaves added, then "make it smaller"). Treat the latest instruction as superseding an earlier one for the same element, and keep a comment recording why.
- **The user pushes back whenever a large-screen section feels big or heavy.** Default to compact cards, modest type and generous whitespace on desktop.
- **Do not invent testimonials or other social proof presented as real.** The stand-in quote exists only because the user explicitly asked for it for design review, and it is flagged everywhere (code comment, `isPlaceholder`, `data-placeholder`, need-review note).
- **Never kill all node processes** (`taskkill /IM node.exe`). It killed the user's own dev server on port 4300 this session. Stop only the specific process you started.
- **Playwright verification loop** (same as the earlier handoff): `npm install --no-save playwright`, write a throwaway script to the repo root, screenshot, read the images, then always clean up (`rm -f shot.js *.png`, `npm uninstall playwright`, check `git status`). When clipping a section, hide or ignore the fixed header and CTA chrome, which otherwise appears over the screenshot. Scroll through the section first so the `.reveal` elements settle before measuring.
- Python is not installed on this machine, so use Node or shell for scripting and edit files with the Edit tool.
- **House rules** (CLAUDE.md): standalone components with no `standalone: true`, no explicit `OnPush`, signals, `@if`/`@for`, no `ngClass`/`ngStyle`, `NgOptimizedImage` for static images, WCAG AA and AXE. The CSS budget in `angular.json` for component styles is 16kB warning and 28kB error.
