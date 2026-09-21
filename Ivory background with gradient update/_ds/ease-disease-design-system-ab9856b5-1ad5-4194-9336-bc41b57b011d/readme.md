# [BRAND NAME] — Ease Disease Design System

A digestion-first functional medicine practice in India. The site is **one scrollytelling homepage**: a continuous story from symptom to root cause to the path out, ending on a booking. There are no stacked "sections" visually — one fixed background canvas moves through an ordered set of color stops as the reader scrolls, and content floats on top of it.

## Sources

- `uploads/PRD Ease Disease_ Scope & Timelines.txt` — scope, story order, Level 1 facts (30 min, ₹499), page inventory (Events / Login / Community), founders (Carol, Deepa, Dr. Akshai Kolagani).
- Palette artifact "Oxblood & Ember" — `https://claude.ai/artifact/2847QQTYbeoFCi6C4avjP6`. **Not machine-readable from this project.** Token names, families, radii, shadow intent, the ember gradient and `--ease` come from the brief; the hex values in `tokens/colors.css` are a faithful reconstruction and should be diffed against the artifact. Everything downstream reads the CSS variables, so correcting the seven base hexes propagates through the whole system.
- Reference sites named in the PRD: himanshugarg.in, parsleyhealth.com, deeparajani.com (current site). Motion reference supplied in chat: the Dribbble 3D smart-water-bottle scene (continuous scene, object stays on screen, scene changes around it).
- `uploads/cred-garage.png` — supplied as an interaction reference only; none of its visual language is in this system.

**No logo was supplied.** Every place a mark would go renders the brand name in Fraunces (`Wordmark`). Do not draw one.

## Brand voice in five lines

1. Plain clinical language. Functional medicine explained the way a good doctor explains it at the desk, not the way a wellness brand sells it.
2. Second person, present tense: "what your digestion is doing", not "what patients experience".
3. Claims are specific or they are bracketed placeholders. No invented statistics, ever.
4. Calm, not urgent. No countdowns, no scare copy, no "toxins".
5. The guide is software and says so. It is labelled "Ease guide" and is never given a human or doctor persona.

## The rules

- **One canvas.** A single fixed background element owns color. Sections are transparent and never carry a fill, a seam, or a band. (This replaces the palette artifact's two-tone ivory/parchment bands and its "never gradient section backgrounds" rule.)
- **Interpolate in oklab** — `color-mix(in oklab, …)` between the current stop's `from` and `to`, driven linearly by section progress.
- **The ember gradient is for the primary CTA only.** Not cards, not headers, not section grounds.
- **Evidence-blue `#0E86C4` is evidence only** — ticks, credential marks. Never a CTA, never body text, never a surface.
- **Honey is a text highlighter only** — a wash behind words, and only behind **ink** text (10.5:1). On dark stops, where the headline is ivory, the wash drops to a 0.1em underline-weight mark below the baseline so it never crosses a glyph — ivory over honey is 1.6:1. Never a fill.
- **No navbar anywhere.** Navigation is one dot, top right, opening a full-screen overlay with Events, Login, Community.
- **Ivory is the ground.** The canvas is ivory-first for the whole scroll and never goes dark. Darkness is a **surface** — `--surface-deep` (oxblood) panels placed on the light page, for the beats that need weight.
- **Body copy follows contrast, not taste.** Under 24px requires 4.5:1; 24px and up may use 3:1. On the ivory-first canvas ink clears 12.58:1 at its worst, so body copy is allowed at every stop; the ratios that need watching are inside deep panels.
- **No lorem ipsum, no invented statistics, no emoji.** Unknowns are bracketed: `[BRAND NAME]`, `[LEVEL 2 DESCRIPTION]`, `[SUPPORT EMAIL]`.
- **Level 1 is real** (30 minutes, ₹499). Levels 2–4 carry no prices and read "coming after your call".
- **Icons are inline stroke SVG**, 1.4–1.6px, round caps and joins, drawn at 16/18/20px.
- **Touch targets never below 44px.**

### Do

- Let one stop hold for a whole scene when the argument needs the reader's attention.
- Use `--surface-deep` when a beat needs weight: the root-cause panel, the menu overlay, the footer close block, the chat header.
- Keep deep panels framed — 24px radius, `--shadow-lift`, generous inset padding. A dark panel is an object on the page, not a band across it.
- Keep the floating CTA and the Ease guide bubble on screen for the entire scroll.

### Don't

- Don't let the canvas go dark. Oxblood belongs on panels, overlays and cards, never on the background.
- Don't fade a section background in or out — the canvas is the only thing that changes color.
- Don't pin a scene longer than two screen-heights.
- Don't use raw ember-b, terracotta, oxblood or evidence-blue as a canvas value. Ember and terracotta appear in the canvas only as tints of 14% or less; oxblood only as a panel.
- Don't add a second gradient, a second accent, or a color outside `tokens/colors.css`.
- Don't style the Ease guide as a person: no avatar photo, no first name, no stethoscope.

## Story-color logic

| Stop | Beat | From → To (resolved) | Text | Body copy |
|---|---|---|---|---|
| `canvas-hero` | Arrival, digestion at the centre | #FBF7F0 → #F9F2E8 | ink | yes |
| `canvas-hook` | What your doctors will not tell you | #F9F2E8 → #F4E9DA | ink | yes |
| `canvas-descent` | Root causes, the deepest beat | #F4E9DA → #F0E2CE | ink | yes |
| `canvas-turn` | The ember dawn | #F0E2CE → #ECD6C0 → #F0D5BB | ink | yes |
| `canvas-levels` | Levels 1–4, the path out | #F0D5BB → #F6EEE1 | ink | yes |
| `canvas-team` | Clinical rigor | #F6EEE1 → #FAF5ED | ink | yes |
| `canvas-close` | Since you are here, start now | #FAF5ED → #F6F4EC (ivory + faint sage) | ink | yes |

The canvas is **ivory-first**. It stays inside a narrow warm-light range — okL 0.89 to 0.98 — for the entire scroll, so the blend is felt rather than seen, and ink reads at 12.58:1 at its very worst. Stops are **chained**: each stop's `--to` is literally the next stop's `--from`, so there is no discontinuity anywhere. The ember dawn is warmth, not brightness: ember-b at 14% strength in the turn, with full ember reserved for the booking CTA.

There is **no text flip and no breathing zone** any more. Both existed to survive a canvas that ran from near-black to bright orange, and that canvas is gone.

Darkness moved to surfaces. `--surface-deep` (#2B0A0F), `--surface-deep-soft` (#420E17) and `--surface-deep-raised` (#5A1220) are framed dark objects on the light page — the root-cause scene panel, the menu overlay, the footer close block, the chat header, dark cards. Ivory on them runs 12.75–17.05:1, parchment 10.68–14.29:1, honey 8.11–10.85:1, and ember-b 5.09–6.81:1 for display and accents. Every ratio is tabulated in `tokens.json` under `contrast`, and `guidelines/canvas-journey.html` shows the whole blend end to end, with a deep panel in place, so it can be judged by eye.

## Content fundamentals

- **Casing:** sentence case everywhere except eyebrows and labels, which are DM Mono uppercase with 0.18em tracking ("THE HOOK", "LEVEL 01").
- **Person:** "you" for the reader, "we" for the practice. Never "I".
- **Numbers:** DM Mono. Prices as `₹499`, durations as `30 min`, joined with a middot: `30 min · ₹499`.
- **Headlines** are claims, not labels: "Digestion is where most chronic symptoms begin", not "About digestion".
- **Body** is two or three sentences, 62ch measure, no bullets inside a scene.
- **CTA copy** is a verb and an object: "Book a consultation", "See the levels", "Join the community".
- **Emoji:** none. **Exclamation marks:** none.

## Visual foundations

- **Color:** seven base colors plus honey and evidence-blue, on an ivory-first page. The canvas is warm light throughout; oxblood is reserved for deep panels; ember appears at full strength only on the booking CTA. Sage-soft is the only cool note and appears once, as a 10% tint in the closing stop.
- **Type:** Fraunces (display, 400/600, optical sizing) for claims and level names; DM Sans for all body, buttons and chat; DM Mono for eyebrows, labels, prices and metadata. Display tracking −0.02em, line-height 1.04; body 1.55.
- **Scale:** fluid `clamp()` from 390px to 1440px — display-xl tops out at 104px, body-m at 18px.
- **Spacing:** 4px base, scale 4→160. Gutters 20px mobile, 64px desktop, 1200px container.
- **Backgrounds:** no images, no patterns, no grain, no texture. The canvas color is the background. Imagery is photography only (team portraits, condition imagery) in warm natural light; placeholders until supplied.
- **Radii:** 6/10/16/24/32px and `999px` for pills. Cards are 24px, chips and CTAs are pills, chat bubbles 16px with one 6px corner toward the speaker.
- **Cards:** an ivory or dark-oxblood surface, a 1px hairline (`--rule-on-light` / `--rule-on-dark`), `--shadow-soft` at rest, `--shadow-lift` on hover. No colored left borders, no gradients.
- **Shadows:** two ambient steps plus one ember-tinted shadow used exclusively under the primary CTA.
- **Transparency and blur:** only for elements that sit *over* the canvas — the menu dot, the chat launcher, input fields (`--surface-glass-*` at 6–8% and `--blur-panel`). Never on content.
- **Animation:** `--ease: cubic-bezier(.2,.7,.2,1)`. Micro 160ms (hover, press), base 320ms (reveals, overlay), scene 720ms (canvas settle). One ambient loop: the 26s `ember-drift` across the CTA gradient. Scroll scrubbing is linear against section progress; pins cap at 200vh.
- **Hover:** lift 1px plus a shadow step; menu and overlay links shift to honey. **Press:** scale 0.98, no color change. **Focus:** the browser ring with 2px offset — never removed.
- **Reduced motion:** the canvas snaps to the nearest stop color, scrubbing and drift stop, reveals are instant, and every text block stays readable at its static stop color.

## Iconography

No icon set was supplied and no codebase was attached. Icons are **hand-drawn inline stroke SVG inside each component** — 16/18/20px viewboxes, 1.4–1.6px stroke, `round` caps and joins, `currentColor`, `fill="none"`, always `aria-hidden` with the label on the parent. In use: arrow-right (CTA), speech bubble and close (chat), send paper-plane (chat input), check (evidence tick). No icon font, no sprite, no PNG icons, no emoji, no unicode glyphs as icons — the one unicode character in the system is the middot separator in metadata. If an icon library is ever needed for breadth, match Lucide's 1.5px stroke geometry and flag the addition here.

## Components

Built (`components/<group>/`):

- **brand/** — `Wordmark`
- **actions/** — `CtaPill`
- **chat/** — `ChatBubble`, `ChatPanel`
- **content/** — `EyebrowLabel`, `DisplayBlock`, `EvidenceTick`
- **navigation/** — `MenuDot`, `MenuOverlay`
- **story/** — `SymptomNode`, `Thread`
- **surfaces/** — `LevelCard`, `TeamCard`, `FooterClose`

Every component the brief asked for is built. Nothing outstanding.

Each directory carries `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and one `@dsCard` HTML preview.

## Index

- `styles.css` — the single entry point consumers link; `@import`s only.
- `tokens/` — `fonts.css`, `colors.css`, `canvas.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`.
- `tokens.json` — machine-readable mirror: base colors, canvas stops with scroll intent, the full contrast table, type/space/radius/shadow/motion groups.
- `components/` — reusable primitives, grouped above.
- `ui_kits/root-map/` — **The Root Map**: the lead homepage recreation. Sticky three-layer symptom map, scroll-driven reveal, tap to trace your own roots. Built from `uploads/root-map.html`.
- `ui_kits/scrollytelling/` — the earlier seven-scene canvas walk, with a pinned vertical descent and a pinned horizontal levels rail.
- `guidelines/canvas-journey.html` — the whole scroll blend, first stop to last, with display and body samples at each stop.
- `thumbnail.html` — homepage tile.
- `ui_kits/scrollytelling/` — the homepage itself: one canvas, seven scenes, a pinned vertical descent and a pinned horizontal levels rail. Read its README for how the scroll is wired.
- `SKILL.md` — entry point when this system is used as an agent skill.
- `uploads/` — original brief material, including `root-map.html`, the prototype the Root Map kit recreates.
