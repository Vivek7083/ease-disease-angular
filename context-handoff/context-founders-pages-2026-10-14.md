# Ease Disease: Context Handoff, Founders pages (Carol + Deepa)

**Date:** 2026-10-14
**Builds on:** `context-2026-10-02.md` (design system, working style), `project-context-2026-09-22.md`. Read those first; this doc covers only the **Founders pages** built after them, plus what to do next.

## What was built this session

Two fully separate, dedicated founder pages replaced the old shared `founders.ts` (single template, `:focus` route param). Each founder now has her own route, her own component, and **no content from the other founder** except a tab link to switch.

- `/founders/carol` → `src/app/features/founders/carol-profile/` (`carol-profile.ts/html/scss`)
- `/founders/deepa` → `src/app/features/founders/deepa-profile/` (`deepa-profile.ts/html/scss`)
- `/founders` redirects to `/founders/carol`.
- `src/app/app.routes.ts` wires both as `loadComponent` (lazy).
- The home page's expert carousel CTA (`src/app/features/home/home.ts` → `onExpertConnect`) navigates to `/founders/:slug` instead of opening the booking form directly. `TeamMember` gained `slug`, `ctaStyle: 'link'`, `photoPosition`.
- `src/app/shared/components/team-card/team-card.ts`: the desktop "spotlight" carousel's `<img [ngSrc]>` is now wrapped in `@for (photo of member().photo ? [member().photo] : []; track photo)` instead of binding `ngSrc` directly — fixes an **NG0953** crash (Angular throws if `ngSrc` mutates on an already-initialized node; the spotlight reuses one persistent card across experts). Also added a `.cta-link` style (hairline-underline link, matching home's `.source-link`) for `ctaStyle: 'link'`.
- `src/app/shared/components/social-links/social-links.ts`: new shared component, supports `linkedin | instagram | facebook | youtube`. A link with no `url` renders disabled with a "Soon" label instead of a dead link.

### Carol's page — portfolio/resume style

Built from 5 LinkedIn screenshots the user supplied (profile header, a HELPED certificate-of-participation post, Experience, Licenses & certifications, Skills). Sections: hero (photo + headline + socials + tabs), About, pull-quote, Featured post (certificate card), Experience (`<ol class="timeline">`), Certifications (`cert-grid`), Skills (chip groups), close CTA.

- LinkedIn live: `https://www.linkedin.com/in/carol-r-774526103/`
- Instagram live: `https://instagram.com/carolribeiro.nutrition` (tracking query param stripped from the URL the user pasted)
- Illustration placeholders (dashed box, "AI-generated" label) mark where real artwork should eventually go — hero and the certificate card.

### Deepa's page — book/programme/community style

Deliberately **not** the same layout as Carol's (explicit user instruction: "both founders dont need to have the same kind of layout page"). Built from `deeparajani.com` (fetched), her LinkedIn, and screenshots of her site's "An Author" / "Certifications and Collaborations" sections. Sections: hero, About, pull-quote ("The Magic begins when your soul awakens" — her own tagline), **One book** (see below), Programmes (E.A.S.E. Dis-ease, F.A.B. L.I.F.E.), Certifications & collaborations, reader testimonials, close CTA.

- Socials all live: LinkedIn, Instagram (`ays.awakenyoursoul`), Facebook (`celiacmanagementby.deeparajani`), YouTube channel.
- **Only one published book** — `The Magic In You`. An earlier version invented a second "coming soon" book (`Healing Begins in the Gut`); the user corrected this (she's only written one so far) and it was removed.
- Real cover art supplied by the user (`C:\Users\Admin\Downloads\Nutri\founders\deepa-books\The-Magic-In-You-J-3009-Front.webp`) → copied to `public/images/books/the-magic-in-you.webp`.
- Amazon buy link: `https://www.amazon.in/Magic-You-Deepa-Rajani/dp/9390166322`.

## Design decisions (the user steered these, in order)

1. **Deepa's team photo** (`public/images/team/deepa.jpg`) was swapped to a 16:9 photo where she's framed on the left; `photoPosition` tuned over several rounds down to `5% center` so her face lands centered in the circular/card crop instead of empty background.
2. **"Know more about {name}"** replaced "Connect with {name}" as the carousel CTA, styled as a hyperlink (`ctaStyle: 'link'`) matching home's `.source-link` — this was missed on the first pass and had to be added after the user pointed it out. Clicking routes to that founder's page.
3. **No cross-founder content.** First draft had a `:focus` route param and shared template with scroll-to-other-founder behavior; the user explicitly corrected this — each founder's page shows *only* her own content, with a tab that **navigates** (real route, not scroll) to the other.
4. **Tab switcher placement/size**, iterated twice:
   - First: inline in the hero copy column, scroll-centered.
   - Then: pinned `position: absolute` top-right of the hero on desktop (≥900px), small pill. Mobile keeps it inline.
   - **Bug found and fixed:** the tab nav originally lived *inside* the hero's `.reveal`-animated wrapper div. `.reveal`'s hidden state uses `transform: translateY(28px)`, and any non-`none` `transform` creates a new absolute-positioning containing block — so during a routed navigation's re-entry animation, the tab nav was briefly (and sometimes persistently, depending on timing) positioned relative to the narrower text column instead of the full-width hero, i.e. it visually "jumped to center." Fixed by moving the tab `<nav>` out of the `.reveal` div (sibling, not descendant) in both `carol-profile.html` and `deepa-profile.html`. Verified via Playwright: sampled the tab's `getBoundingClientRect()` every 100ms through a full click-navigation; position never moved.
5. **Carol's hero photo** was cropped awkwardly high; `object-position: center 70%` added to show more of the lower portion (shoulders) instead of cutting across the face area.
6. **Yellow highlight + pull-quote**, matching home's hero `.mark` treatment (`.hero-headline .mark` in `home.scss`) and its italic display-font close-quote (`.hook-close`): both added to Carol's and Deepa's pages as local `.mark` / `.pull-quote` CSS (duplicated per component, same pattern as `.founders-tabs` — not shared via a common stylesheet). Not the scroll-driven word-by-word fill version from home (`--fill` custom property driven by scroll position) — just the static visual treatment.
7. **Programme card colors**, iterated three times:
   - First: both cards used `var(--gradient-ember)` (same vivid orange) — user said the section "doesn't look good."
   - Second attempt: gave F.A.B. L.I.F.E. a distinct burgundy/oxblood gradient, kept E.A.S.E. Dis-ease orange — user said colors were "still odd, too vibrant."
   - **Final:** both cards use the *exact same* background as the home page's `app-team-card` shell (`color-mix(in oklab, var(--honey) 18%, var(--ivory))` → `color-mix(in oklab, var(--honey) 8%, var(--parchment))`, the "champagne-to-parchment" gradient) — off-white, identical on both cards, text in `--ink`/`--oxblood`/`--olive`. The user does **not** want the two programmes color-coded differently; they're told apart by copy alone.
8. **Hero top padding**: both `.carol-hero`/`.deepa-hero` increased top clearance (`max(calc(var(--sp-20) + env(safe-area-inset-top, 0px)), calc(var(--sp-10) + 8vw))`), matching the same pattern already used in `home.scss`'s `.hero` — `app.scss`'s `.chrome` (wordmark + CTA pill) is `position: fixed`, floats above all page content regardless of a section's own padding, so on mobile the heading was crowding right up against it.
9. **Book cover sizing/cropping**, iterated several times:
   - Original container used a generic `aspect-ratio: 3/4` with `object-fit: cover` — mismatched the real artwork's ratio (`243 × 371` px, confirmed via Playwright `naturalWidth/naturalHeight`), so `cover` cropped the bottom of the cover (cut off "DEEPA RAJANI").
   - Fixed by setting `aspect-ratio: 243 / 371` (the image's real ratio) and `object-fit: contain` — guarantees the full cover is visible at any screen size per explicit user instruction ("the book cover should be fully visible in any screen size... all parts of it").
   - A parchment-tint background was added as a letterbox fill, then explicitly removed at the user's request ("remove the background color no need of it") in favor of a thin 1px terracotta→honey gradient border (`background: linear-gradient(...) border-box` + `border: 1px solid transparent` trick) around the cover.
   - Desktop originally stretched the cover to `height: 100%` with `aspect-ratio: auto` to fill the card row — this blew the letterbox gap out into a large solid-color block on wide screens instead of a thin border. Fixed by keeping the aspect-ratio fixed at all breakpoints and using `align-items: center` on `.book-feature` instead of `stretch`.
   - Final size: **156px wide** (down from an original 260px — "reduce the book cover image by 40%").

## Verified

- `npx tsc -p tsconfig.app.json --noEmit` clean after every round of edits.
- Playwright (headless Chromium, `executablePath` pointed at the locally cached `chromium-1243/chrome-win64/chrome.exe` — the npx-downloaded Playwright version otherwise expects a newer `chromium_headless_shell` build not present locally) used repeatedly to:
  - Screenshot both pages full-page at desktop (1200–1440px) and mobile (390px) widths, with `reducedMotion: 'reduce'` to force `.reveal` elements to their final visible state (otherwise a static full-page screenshot catches below-the-fold content still at `opacity: 0`, which looks like missing content but isn't — confirmed by comparing normal vs. reduced-motion captures).
  - Confirm `document.documentElement.scrollWidth === viewport width` at 390/1200/1440px (no horizontal overflow) after each layout change.
  - Confirm zero console/page errors.
  - Reproduce and then verify the fix for the tab-position bug (see point 4 above) by sampling `getBoundingClientRect()` through an actual click-navigation.
- **Not verified:** real devices, screen-reader behavior, AXE run on either page.

## Open items

1. **Deepa's Instagram URL** is now live (`ays.awakenyoursoul`, found via her own site) — originally the user said "later I will add the url for that," so double-check with her that this is the right/current handle before treating it as final.
2. **Illustration placeholders** on both pages (hero + Carol's certificate card) are still dashed-box stand-ins — need real AI-generated or supplied artwork.
3. **Events/retreats page** (`event-retreats.ts/html`) was mentioned once early in the session as a future need, explicitly deferred ("for now lets focus on experts section and a page transition to a page about our founders"). Not started.
4. **Deepa's testimonials** (Ketan Bhatia, Dipti, Laveena Wadhwa) were pulled verbatim from her existing site's copy — same caution as the Results-section placeholder testimonial in the earlier handoff: these are **real quotes from her real site**, not invented, but worth a founder sign-off pass since they weren't given directly to this session.
5. Carol's "+3 more credentials" cert card is a placeholder acknowledging only 2 of 5 certifications were visible in the LinkedIn screenshot — the other 3 are unknown and need the real list from Carol.
6. Same still-pending items from the earlier handoff apply site-wide (pricing, programme scope, format, privacy/refund policy, PWA icons).

## Reference and working-style notes

- **The user iterates in small, concrete, sometimes-contradicting visual steps**, especially on color ("too vibrant" → try again → "still odd" → try again → "go with X instead, both the same"). Each round converges — don't assume the first fix attempt is final; wait for explicit confirmation ("looks good now") before considering a visual thread closed.
- **When the user's wording is garbled or ambiguous** (e.g. "the book image should take its length and color of the ease-disease tile and the f.a.b life hass not been changed yet"), it was worth pausing to ask a clarifying question (`AskUserQuestion`) rather than guessing — got a clean, actionable answer back in one round instead of risking a wasted implementation pass.
- **Root-cause debugging over guesswork, when asked.** The user has explicitly asked, more than once (in earlier sessions on this same codebase — see memory/prior context), not to patch symptoms blindly. The tab-position bug this session was diagnosed by direct measurement (`getBoundingClientRect()` sampled through a real navigation), not assumption, before writing the fix.
- **Static full-page Playwright screenshots can look broken when they aren't**, if the page uses `appScrollReveal`/`.reveal` — below-the-fold elements sit at `opacity: 0` until their `IntersectionObserver` fires, which doesn't reliably happen for a resize-based full-page capture. Always cross-check with `reducedMotion: 'reduce'` (forces `.reveal { opacity: 1; transform: none }` globally) before concluding content is actually missing.
- **`transform` on any ancestor creates a new containing block for `position: absolute` descendants**, even a "mid-animation" or soon-to-be-`none` transform. Worth checking for this specifically whenever an absolutely-positioned element's placement looks right on first load but wrong after a client-side re-render/navigation.
- Playwright via `npx` lands in an ephemeral `_npx` cache directory (`C:/Users/Admin/AppData/Local/npm-cache/_npx/<hash>/node_modules`) not on Node's default resolution path — scripts in the scratchpad need `NODE_PATH` pointed at it explicitly. The cached hash can change between npx invocations; re-discover it with a `find`/`Glob` for `playwright` under `_npx` if a script suddenly can't `require('playwright')`.
- House rules (CLAUDE.md) unchanged from the earlier handoff: standalone components, no `standalone: true`, no explicit `OnPush`, signals, `@if`/`@for`, no `ngClass`/`ngStyle`, `NgOptimizedImage` for static images, WCAG AA and AXE.
