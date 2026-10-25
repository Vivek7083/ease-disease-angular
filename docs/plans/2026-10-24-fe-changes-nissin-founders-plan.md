# Plan: front-end changes from Nissin (Product) and the founders

Source: `fe-changes-nissin-and-founders.txt` (19 items, including the meeting notes in item 18 and the Carol copy in item 19).
Status: **PLAN ONLY. No code has been changed.** Each slice is built only after the owner approves it and its open questions are answered.
Rule for every slice: build or test green, update this doc, then commit. Mobile-only or desktop-only changes go inside the matching media query. Keep the existing design language unless the slice says otherwise.

## 0. What the code looks like today (verified in the code, not from comments)

| Fact | Where |
|---|---|
| The palette was changed from burgundy/olive to navy on 2026-10-17 (`29ebada`, `d8b487a`). Token **names were kept** (`--oxblood`, `--olive`), only their values changed. So "bring burgundy back" means changing values in one file, but every component using `--oxblood` follows. | `src/styles/tokens/colors.css` |
| Old values (from `409cd9b`): `--oxblood-deep #2B0A0F`, `--oxblood #5A1220`, `--olive #4A5726`, `--terracotta #C06B4A`, `--ember-a #B33A1E`, `--ember-b #E8853A`, `--honey #F2C14E` (yellow), `--text-quiet-dark #E4D6CC`, `--rule-on-dark #7A3A3F`, `--surface-card-light var(--ivory)`. Now: navy `#12293B` / `#213848`, olive is navy too, honey is `#00AEEF`. | git history |
| The root map's lit chips were three colours (symptoms terracotta-mixed-with-burgundy, conditions olive, roots burgundy; selected burgundy; links olive/burgundy). `29ebada` made every lit chip, selected chip and link the blue `#00AEEF` with black text. | `root-map.ts` ~lines 321-330, 547-560 |
| The vine divider (`<app-section-transition variant="vine">`) still exists in the component. It was only removed from `home.html` (`d794d63`). Today's dividers: curtain (after root map), dots (after philosophy), wave (before community). Between most other sections there is none. | `home.html`, `section-transition.ts` |
| Home order today: hero, quote, root map, curtain, philosophy, dots, transform (treat), results, packages, testimonials, wave, community (contains the conventional vs functional compare), experts, events. | `home.html` |
| The philosophy ("hook") section is now alternating image/text rows at every width. The old pinned scrollytelling deck and the mobile stacked cards are dead code in `home.ts`, `home.scss` and the unused `#hookCopy` template. | `philosophy.ts`, `home.html` |
| Packages (mobile): a draggable track with a triangle marker (`.gauge-thumb`, `clip-path` triangle) over numbered ticks. Desktop: sticky numbered nodes beside stacked cards. `level-card` already has a `locked` state with a lock badge, used for packages that cannot be bought yet. | `level-selector.ts`, `level-card.ts` |
| Experts section on Home already has: eyebrow "Meet the experts", h2 "Understanding Your Health, Together", and the exact paragraph from item 1. Expert cards are solid navy (`--oxblood`) since `eb68ce6`; before that they were a champagne/parchment card with a honey hairline and inner frame. | `home.html` 183-193, `team-card.ts` |
| Navbar links today: Home (not on Home), Events, Experts, My bookings (signed in), Log in / Sign up. **No Community link.** The footer and the phone menu sheet have no Community link either. | `site-nav.ts` ~lines 185-205 |
| Footer uses `--surface-deep` (= `--oxblood-deep`), so it follows the palette tokens. | `site-footer.ts` |
| The Carol page has: hero (Instagram and LinkedIn icons, location), about, pull quote, featured certificate post, an experience timeline, certifications (2 + "3 more"), skills chips, closing CTA. | `carol-profile.html/.ts` |
| Results heading is "When YOU take the right action, YOU transform" with subtext below it. | `results.html` |
| Breakpoints used across the site: 640, 700, 760, 800, 899/900, 1199/1200. Nothing targets a MacBook or a retina display specifically. | grep of all media queries |

## 1. Slices, in the order I suggest

Order logic: colours first (several later slices depend on them), then page structure, then individual sections, then the Carol page and typography polish.

Confidence below is **my confidence that I understand what you want** and will build the right thing on the first try. None is above 99% yet; the questions are what close the gap.

### S1. Restore the burgundy and olive palette tokens (items 5, 10, 13)
- **What I understood:** put back the old burgundy (`--oxblood`, `--oxblood-deep`) and olive (`--olive`) values, so every "dark blue" surface becomes burgundy (or olive where it was olive), and the footer goes back to its old colour. The blue `#00AEEF` stays only as the text highlight ("listen", "Optimum Health.", selection).
- **How:** change values in `colors.css` only, then walk every component that uses `--oxblood`, `--olive`, `--surface-deep`, `--rule-on-dark`, `--text-quiet-dark` and fix contrast and any place that was hand-tuned for navy (for example the team card's pale-blue foliage stroke, hard-coded `#d6e2ec`).
- **Risk:** the tokens are used everywhere, so this one change moves many surfaces at once (footer, menu overlay, level cards, compare panel, chips, booking dialog, status pages). I will list every surface that changes and check each at desktop and phone width, plus axe.
- **Confidence: 85%.**
- **Questions:**
  1. Restore the **exact** old values (`#5A1220` burgundy, `#4A5726` olive, `#2B0A0F` deep)? Or do Nissin or the founders have a specific burgundy and olive hex in mind?
  2. The orange-red CTA gradient: old (`#C06B4A`/`#B33A1E`/`#E8853A`) or keep the current (`#BF3820`/`#E06F27`)? You said "previous colours where blue is used", which does not cover the buttons' gradient, but old and new look different.
  3. Blue stays **only** as text highlight. Where the blue is currently a *fill or decoration* (the root-map links, the compare panel ticks, timeline dots, the `--honey` accents on dividers and cards), should they all go back to the old yellow honey/burgundy/olive, or stay blue? My default: everything except the three text highlights goes back to the old colours.
  4. Dark card text colour: black text on `#00AEEF` was set deliberately. Burgundy surfaces need ivory text again. OK?

### S2. Root map and conditions colours (items 5, 6)
- **What I understood:** the three tree layers get their own colours again: symptoms terracotta/burgundy mix, conditions olive, roots burgundy; selected node burgundy; links olive/burgundy instead of blue. Blue stays only as text highlight.
- **Item 6** ("conditions we treat... bring the old colour back") I read as the **same root-map section** (it is the section that shows the conditions). If you mean the separate `conditions-board` component, tell me. The conditions board is not mounted on Home today (only the root map is).
- **Depends on:** S1 (tokens).
- **Confidence: 80%.**
- **Questions:**
  1. Is item 6 the root map? Which screenshot or version is the "old colour" you mean: the terracotta/olive/burgundy trace in `409cd9b`?
  2. Which part is "the thing we show now": the lit chips, the links, the selected chip, or the small notes?

### S3. Footer back to the old colour (item 13)
- **What I understood:** the old footer was the burgundy `--oxblood-deep` surface with `--text-quiet-dark #E4D6CC` and `--rule-on-dark #7A3A3F`.
- **Likely done by S1** (it follows the tokens). This slice is only a check plus any hand-tuned colour left over.
- **Confidence: 90%.**
- **Question:** was the footer ever different from "burgundy-deep with ivory text"? If you have an older screenshot, send it.

### S4. Experts section: heading, glass cards, Carol photo (items 1, 14, 16)
- **Item 1 status: mostly already there.** The wording is identical to what you listed. What differs: today "Meet the experts" is a small mono **eyebrow** and "Understanding Your Health, Together" is the **h2**. You want "MEET THE EXPERTS" as the **heading** and "Understanding Your Health, Together" as the **subtitle**. I will swap their roles (heading styled as the section's `t-display`, subtitle below it, paragraph unchanged), keep one h1/h2 per section, and the "last word in burgundy" rule from item 18 applies to this heading.
- **Item 14:** "experts banner colour back to the previous whitish classy glass design". I read "banner" as the **expert cards** (`team-card`), which were the champagne/parchment card with the honey hairline and inner frame before `eb68ce6`. Restoring that means undoing that commit's card styling (and re-adding dark text, the olive foliage stroke, and `ghostDark` button variant).
- **Item 16:** the Carol image on Home zoomed out by 25%. I read this as: the portrait inside the circle shows more of the person (smaller subject), i.e. the image scaled to 75%, through `object-position` and a `scale`, not by shrinking the circle. Same for Deepa? Only Carol was named.
- **Confidence: item 1 90%, item 14 65%, item 16 70%.**
- **Questions:**
  1. Item 14: do you mean the expert **cards**, or the whole experts **section background**, or something else called a "banner"? (The founders "billboard banner" was removed in `02da2ab`; I assume it is not that.)
  2. "Whitish glass": the old champagne/parchment look with the gold hairline (restore exactly), or a truly translucent frosted-glass card (new)?
  3. Item 16: confirm "zoomed out" = more of the person visible inside the same circle. And apply to Deepa too for consistency?
  4. The expert cards also appear on the mobile carousel. Same colours there?

### S5. Section order, and the compare as its own section (items 12, 11)
- **Today:** Packages, Testimonials, [wave], Community (intro + conventional vs functional compare + WhatsApp link), Experts.
- **Target order (item 12):** Packages, **Conventional vs functional**, Testimonials, **Community**, then Experts and Events as now.
- **What I understood:** split the compare out of the community section into its own section with its own heading (so it is no longer called "the community"); Community becomes a standalone section with the same padding and margins as the others (item 11), keeping its intro, the WhatsApp join link and whatever else it shows today.
- **Confidence: 80%.**
- **Questions:**
  1. The compare needs its own eyebrow and heading now. Wording? Suggestion: eyebrow "Two ways of looking at health", heading "Conventional vs Functional Medicine" (last word burgundy).
  2. "Community feels as it is now": is the community **content** staying exactly as today (eyebrow "The E.A.S.E. Community", "Learn, Connect, and Discover", intro, WhatsApp link) and only the compare is moving out?
  3. Anything between Community and Experts? Today the order is Community, then Experts, then Events. Confirm that stays.

### S6. One consistent section divider, with the vine back (items 4, 8, 11)
- **What I understood:** after every section, the same leafy vine divider (the component and its animation already exist), so scrollers know the next section starts. Because it replaces the current mix (curtain, dots, wave), every divider on Home becomes the vine. Section padding and the heading-to-content spacing get one shared value across sections (item 11) instead of per-section values.
- **Depends on:** S5 (the final section list).
- **Confidence: 70%.**
- **Questions:**
  1. Replace the curtain, dots and wave dividers with the vine everywhere, or keep them and only add the vine where there is none today? I assume replace.
  2. A divider **after the last** section before the footer too? And between the hero and the quote?
  3. Item 18 says "page breaker, life vine divider (back to action), heading as current". Does "heading as current" mean the section headings stay as they are now (no change)? I read it that way.
  4. Vine colours: stem burgundy, leaves olive (the old look), after S1. OK?
  5. Which pages? Home only, or Events, Privacy, Founders too?

### S7. MacBook spacing (item 3, plus the "125% Windows" and "2px padding" notes in 18)
- **What I understood:** gaps, padding and margins look odd on MacBook screens. Today there is nothing specific for them; the wide-screen rules are 900px and 1200px. I cannot see the issue without the screen size.
- **Confidence: 35%.** This is the least clear item.
- **What I need to check it properly:**
  1. Which MacBook (Air 13", Pro 14", Pro 16") and the display scaling set in macOS. The CSS width is what matters: for example 1440, 1470, 1512, 1728 px.
  2. Which sections look odd, and how (too much gap above headings? text too close to the edges? content too wide?). A screenshot with a circle on the problem is best.
  3. Browser (Safari or Chrome)? Safari handles `100vh`, `position: sticky` and `backdrop-filter` differently, which may be the cause rather than the spacing.
  4. The note "hero section screen: 125% for Windows" I read as: at 125% Windows scaling (about 1536 px wide viewport) the hero needs a check. And "logo hero padding increase a bit by 2px", "lr padding by 2px": which element's left/right padding (hero frame, section gutter, or all)? A 2px change is tiny, so I need to know the target.
- I will not guess at this slice. Plan: reproduce at the widths you give, fix in one wide-screen media query, leave phones untouched.

### S8. Packages: lock instead of the triangle, on mobile (item 7)
- **What I understood:** in the mobile packages selector, remove the triangle marker. Show a lock icon on the packages that are not open yet, so people feel that buying one unlocks the next.
- **Verified:** `level-card` already supports a locked state (dimmed card, lock badge, "unlock" button back to level 1). The triangle is `.gauge-thumb`. The ticks are numbered circles.
- **Mobile only** (inside the existing `max-width: 899px` block); desktop untouched.
- **Confidence: 70%.**
- **Questions:**
  1. Which packages are locked? Only the ones the backend/data marks `locked` today, or "everything after the first one" as a design idea (package 2 and 3 show a lock until package 1 is bought)? Today `locked` comes from the data, so I need to see how it is set for the three packages.
  2. Where does the lock go: on the numbered ticks of the selector, on the card, or both?
  3. When tapping a locked tick, should the card show with the lock and an "Unlock with package 1" button (today's locked-card behaviour), or just show a short message?
  4. What replaces the triangle as the "you are here" marker: the filled tick circle only?

### S9. Philosophy section: stacked cards on large screens (items 9, 18 "cards (in laptop) for hook section")
- **Today:** alternating image/text rows on every width (commit `67e5f3f` replaced the earlier pinned scrollytelling and mobile cards).
- **What I understood:** on large screens, show the four points as **stacked cards** (like the old mobile cards), not as a scrollytelling reveal and not as alternating rows. On mobile the old stacked cards come back too ("In mobile old way, stacked cards").
- **Confidence: 55%.** "Stacked cards appropriate for larger screens" can mean a vertical stack of wide cards, a 2×2 grid, or overlapping sticky cards.
- **Questions:**
  1. Vertical stack of wide cards, 2×2 grid, or overlapping "stack as you scroll" cards?
  2. Does each card keep its image? The old mobile cards (code still in `home.ts`) were text cards with a number and a title, with the image behind or beside. Which look do you want: the old card visuals, or new cards using the current images?
  3. Mobile: old stacked cards exactly as they were (the old mobile carousel/stack), or the same new cards at phone width?
  4. "Our philosophy para structurized" (item 18): the intro paragraphs under the heading should be restructured. How? For example three short lines with small icons, a bulleted list, or two columns? Give me the shape you picture.

### S10. Conventional vs functional medicine on mobile (item 17)
- **Today (mobile):** all 11 + 12 points as rows of "conventional line, arrow, functional line", each revealing in turn. Too long and busy.
- **Confidence: 40%.** You said it needs a different way but not which.
- **Options I would offer (pick one, or describe another):**
  - A: A two-tab switch ("Conventional" / "Functional") with the list under the active tab. Simple, short.
  - B: A short "top 5 differences" with a "See all differences" expander.
  - C: A swipeable card per pair of points, one pair on screen at a time.
- Question: which of A, B, C, or something else? Also, can we cut the number of points shown on phones, and who decides which?

### S11. Carol page (items 15, 19)
- **Remove** (as I understand "remove all unnecessary things that don't fit the page purpose"): the experience timeline, the skills chips, the featured certificate post ("A recent moment"), the location line, the Instagram link, the "+ 3 more credentials" card, and the old about paragraph.
- **Keep:** the hero with the portrait and name, **only LinkedIn**, the founder tab switch (Carol/Deepa), the closing book CTA.
- **Add:** the new copy from item 19.
  - Title: "A Deeper Understanding of Healthcare".
  - Pull quote: *What if we stopped waiting for disease to take hold before we started prioritising our health?*
  - Paragraphs 1 and 2 as written. The phrases between asterisks (`5+ years of experience in the healthcare industry`, `longer, healthier, more fulfilling lives`) become emphasised.
  - A second quote: "Your food and environment provide information to your body, influencing how your genes express themselves in HEALTH OR DIS-EASE."
  - "About Carol" + "Credentials": the 6 items listed (iCFN iThrive; MBA NMIMS; PG Diploma NHCA Singapore; Lean Six Sigma Green Belt; Infection Prevention & Control; Quality Control). Replaces today's 2-item certifications.
- **Confidence: 70%.**
- **Questions:**
  1. Page order: hero, title with the quote, two paragraphs, second quote, About Carol, Credentials, CTA? Or do "About Carol" and "A Deeper Understanding of Healthcare" mean one block?
  2. The pasted text contains Nissin's chat lines ("About Carol", "Credentials"). I treat them as section labels, not content. OK?
  3. "credentials and linkedin (description)" in the notes: should the LinkedIn link have a short description, for example "Connect with Carol on LinkedIn"? Or does it mean each credential gets a one-line description (the list has none)? I will not invent descriptions.
  4. Headline line "Functional Nutritionist · Root-cause healing… · 5+ years in healthcare": keep, or replace with "Certified Functional Nutritionist and Healthcare Management Professional" from the new copy?
  5. "Meet the founders" eyebrow and the Deepa tab: keep?
  6. Should Deepa's page lose Instagram too (not asked)? I will leave it unless you say so.
  7. "Book a consultation with Carol" CTA at the end: keep?

### S12. Typography and colour emphasis across the site (item 18)
- **What I understood:**
  - Section headings: the **last word (the impactful word)** in burgundy, on all headings (hero "Your Body Is Speaking. It's Time to Listen." keep "Listen." as the blue highlight; "Your Body" burgundy; "You transform" burgundy; "Our Philosophy" capital P and burgundy; "Take the First Step" etc).
  - One heading font size across the site (a shared token, not per-section sizes).
  - Text case consistency ("Take the First Step", eyebrows, button labels).
  - Hero: underline on "E.A.S.E." (the wordmark/brand mention in the hero).
  - Results section: remove the subtext under "When YOU take the right action, YOU transform" and make "YOU transform" burgundy.
  - Transform with E.A.S.E. section: container padding +2px.
  - Testimonials: fix heading, subheading and title.
  - Gap between the packages (the scrollytelling gap on desktop).
- **Confidence: 55%.** Several notes are short ("What (your body) burgundy", "Headings and in all that last word as burgundy, impactful word").
- **Questions:**
  1. Which words in each heading should be burgundy? The rule "last word" breaks for headings ending in a question or a name. I will propose a table of every heading and its burgundy word for you to approve before building.
  2. Hero underline on "E.A.S.E.": where does "E.A.S.E." appear in the hero today? I see "Your Body Is Speaking. It's Time to Listen." and no E.A.S.E. text, only the logo wordmark. Is the underline for the wordmark in the navbar/hero, or a line of text I have not found?
  3. Testimonials: what is wrong with the heading, subheading and title now? What should they say?
  4. "Transform with ease steps container padding by 2px": which container, and increase or decrease?
  5. Heading size: which size is the standard? Today `t-display` uses `--fs-display-l`; some sections set their own. I will list which sections differ and pick `--fs-display-l` unless told otherwise.

### S13. Navbar: Community link (item 2)
- **Already done:** Events, Log in / Sign up, My bookings. **Missing:** a link to the **Community** section (`#community`) in the navbar, phone sheet and footer.
- **Confidence: 85%.**
- **Questions:**
  1. Community link goes to the Home `#community` section (like Experts does), or to the WhatsApp group, or a new page?
  2. Footer: add the same links?
  3. "pages/components if not exist": is there any page where you expect a Community entry that I have not named?

## 2. Dependencies and suggested order

```
S1 palette --+--> S2 root map -----+
             +--> S3 footer       |
             +--> S4 experts      +--> S6 dividers + spacing --> S7 Mac spacing
S5 section order -----------------+
S8 lock (mobile) | S9 philosophy cards | S10 compare (mobile) | S13 navbar   (independent)
S11 Carol page   (independent)
S12 typography   (last, because heading colour needs S1, and sizes need S5/S6)
```

## 3. Things I noticed that you did not list

- Dead code to clean once S9 is done: the old pinned philosophy deck and mobile carousel in `home.ts`/`home.scss`/`home.html` (`#hookCopy`), `BookingCtaService`, and `chat-widget` (unmounted).
- `app.spec.ts` and the 167 existing tests may encode today's colours or order; I will update them with each slice rather than leave failures.
- Hard-coded colours (`#d6e2ec`, `#00aeef`, `#bf3820`, `#e06f27` in `philosophy.ts`) bypass the tokens; S1 should move them to tokens so a palette change is one edit next time.

## 4. Status

| Slice | Items | State |
|---|---|---|
| S1 palette tokens | 5, 10 | Done, committed `c261846` |
| S2 root map colours | 5, 6 | Done, committed `79d3495` |
| S3 footer | 13 | Done, committed `3b6db75` |
| S4 experts | 1, 14, 16 | Done, committed `9c78613` |
| S5 section order | 12, 11 | Done, committed `d504a27` |
| S6 dividers and rhythm | 4, 8, 11 | Dividers done, committed `ad2f9fd`; item 11 spacing not retuned |
| S7 MacBook spacing | 3, 18 | First pass committed `e0d4ddc`; replaced by S14 below |
| S8 lock icon (mobile) | 7 | Done, committed `d2cc2ef` (your commit, labelled "S7" in its message; it is the S8 lock-icon work) |
| S9 philosophy cards | 9, 18 | Done, committed `367efcf` |
| S10 compare on mobile | 17 | Done, committed `eca3977` |
| S11 Carol page | 15, 19 | Done, committed `9e82d10` |
| S12 typography | 18 | Done, committed `91b6dab`; some notes still open |
| S13 navbar Community | 2 | Done, committed `bdaded5` |

**S1 as built (answers: exact old hex, old CTA gradient, blue only for text highlights, ivory on burgundy):**
- `colors.css`: `--oxblood-deep #2B0A0F`, `--oxblood #5A1220`, `--olive #4A5726`, `--terracotta #C06B4A`, `--ember-a #B33A1E`, `--ember-b #E8853A`, `--honey #F2C14E`, `--text-quiet-dark #E4D6CC`, `--rule-on-dark #7A3A3F`. `--highlight-blue` unchanged. `--surface-card-light` left white (not asked).
- `elevation.css` shadows and the conditions note shadow back to the burgundy tint. `gut-hub` dots use `var(--honey)` again; `philosophy.ts` uses `var(--gradient-ember)` and `var(--highlight-blue)` instead of hard-coded hex.
- Blue fills reverted: booking dialog focus ring and selected chips are burgundy with ivory text; conventional vs functional ticks and the "Functional" tag are honey with a burgundy check, the arrow is olive.
- Left blue on purpose: text highlights (hero "Listen.", hook phrase band, "Optimum Health.", Events/Founders/Privacy underlines, display-block) and text selection. Root-map chips and links are still blue until S2. Expert cards are burgundy until S4 restores the glass look; the team-card foliage stroke is still the pale `#d6e2ec` (S4).
- Checks: `tsc` clean, `ng build` passes, 167 tests pass. Visual check: hero only (headless). Other surfaces need an eye on them.

**S2 as built (answers: old three-layer trace; item 6 covered by S1):** correction to section 0: `conditions-board` IS mounted (inside `root-map`: pinboard on mobile, notes around the map on desktop). Its colours already follow the tokens, so S1 restored them and S2 changes nothing there. In `root-map.ts`: lit symptom chip = terracotta mixed 72% with burgundy, lit condition chip = olive, lit root chip = burgundy, selected chip = burgundy, all with ivory text; the traced tree path (`.blue` class, name kept) is olive. No blue left in the map. 167 tests pass, tsc clean.

**S2 revised after your first look:** lit and selected symptom chips (the leaves) olive; lit condition chips (between) burgundy; lit root chips a blend, `color-mix(in oklab, burgundy 55%, olive)`; the traced path burgundy. All chips ivory text. Selected chip is now olive like the other symptom chips (it was burgundy).

**S3 as checked:** `site-footer.ts` has no colour of its own; it uses `--surface-deep`, `--text-quiet-dark`, `--rule-on-dark`, `--olive` and `--sage-soft`, all restored by S1. Headless screenshot of the Privacy page footer (1280 wide): deep burgundy `#2B0A0F` background, soft ivory text, burgundy hairlines. No code changed. Note for S13: the footer links (Home, Why root-cause care, Conditions we support, Packages, Meet the experts, Events & retreats, Book now) have no Community link.

**S4 as built (answers: old champagne card, Carol only, big heading + subtitle):** (1) Home experts section: eyebrow removed; h2 "Meet the Experts" in capitals with "Experts" burgundy; "Understanding Your Health, Together" is an italic subtitle; the paragraph is unchanged (`home.html`, `home.scss`). (2) `team-card.ts`: the pre-navy champagne/parchment card is restored by reverse-applying the changes of `eb68ce6` (gold hairline and inner frame, dark text, olive foliage, `ghostDark` pill). (3) Carol photo: new optional `photoZoom` on `TeamMember`; Carol has `0.75`. The photo shrinks to 75% in its circle, a blurred copy of itself fills behind it and the edge is feathered with a mask. Deepa untouched. Note the source photo is a tight 640x640 crop, so "zoomed out" is simulated; a wider original photo would look better. 167 tests pass, build passes. Screenshots at 1280 and 390 wide checked.

**S4 revised after your first look:** the photo zoom and blur effect are removed (`photoZoom` is gone from `TeamMember` and from Carol). The expert portrait is now a short portrait card (4:5, rounded corners `--r-md`, no effects): 112x140 in the carousel card, 220x275 in the split layout. This applies to both experts so the two cards match.

**S4 revised again:** Carol's card photo is now `public/images/team/carol-card.jpg`, made from `founders/carol_image.JPG` (EXIF-rotated, full width kept, cropped only at the bottom to 4:5, resized 800x1000). `carol.jpg` is untouched because Carol's own page still uses it. Card sizes: portrait 160x200 on phones, 300x375 on large screens (the carousel spotlight); on large screens the name, role, credential and bio are larger and the bio can run to 64ch, so the text fills the card. Deepa uses the same sizes.

**S5 as built (answers: suggested wording, community content unchanged, order as item 12):** new section `#compare` after Packages with eyebrow "Two ways of looking at health" and heading "Conventional vs **Functional Medicine**" (the burgundy part is the impactful phrase, not simply the last word; you said this rule applies to all headings, S12 uses it). `app-approach-compare` moved out of `#community` into it. Home order is now: hero, quote, root map, philosophy, transform, results, packages, compare, testimonials, community, experts, events. The community keeps its eyebrow, heading, intro and WhatsApp link; its link is left-aligned now that it no longer sits under the compare. The wave divider still sits between testimonials and community; dividers are redone in S6.

**S6 as built (answers: vine plus the existing dividers, no vine before the footer, Home and Events, burgundy stem and olive leaves):** the vine (`<app-section-transition variant="vine">`) is back between Home sections wherever there was no divider: quote/root map, transform/results, results/packages, packages/compare, compare/testimonials, community/experts, experts/events. The existing curtain (root map/philosophy), dots (philosophy/transform) and wave (testimonials/community) stay. No vine between hero and quote, and none before the footer. Events page: vine between the intro and Upcoming, and between Upcoming and Past events. The vine's colours come from the restored tokens (burgundy stem, olive leaves). **Not done:** item 11's "same padding and margin between sections" is not retuned; sections still share `.scene` padding, but several have their own overrides. Tell me where gaps look uneven and I will fix those specifically.

**S8 as built (answers: lock on the tick and the card, filled circle as the marker):** phones only (the `gauge-mobile` markup is hidden from 900px up; desktop untouched). In `level-selector.ts` the triangle (`.gauge-thumb`, its CSS and the unused `displayPercent`) is removed; dragging and tapping the track still work. A tick whose package has `locked: true` shows a lock icon instead of its number and its aria-label says "(locked)"; the card keeps its own "Locked" badge. Today only package 2, "Digest with Ease", is locked (the code has two packages, not three). The thin line above the ticks stays. 167 tests pass.

**S11 as built (answers: hero, story, quote, credentials, CTA; LinkedIn icon only; headline from the new copy; keep eyebrow, tabs and CTA):** `carol-profile.ts/.html/.scss` rewritten. Hero: "Meet the founders", "Carol", headline "Certified Functional Nutritionist and Healthcare Management Professional", LinkedIn icon only (no Instagram, no location), the Carol/Deepa tabs, portrait (still `carol.jpg`). Story: label "About Carol", heading "A **Deeper Understanding** of Healthcare" (burgundy phrase), the opening question as a burgundy-ruled quote, the two paragraphs (the two starred phrases are italic and burgundy), the closing quote with "HEALTH OR DIS-EASE" burgundy and kept together on one line. Credentials: heading "Credentials behind the **practice**", the six credentials exactly as written, one card each. Closing CTA unchanged. Removed: old about text, "Health isn't random" quote, featured certificate post, experience timeline, skills chips, "+3 more" card. `images/illustrations/carol-certificate.png` is no longer used by any page. 167 tests pass.

**S13 as built (answers: Home `#community` section, navbar and footer):** `site-nav.ts` link list is now Home (not on Home), Events, **Community** (`/` + fragment `community`), Experts, My bookings (signed in). The phone menu sheet shows the same list, so it has Community too. `site-footer.ts` Explore list has "Community" between Packages and Meet the experts. Clicking Community from the Events page lands on the Community section on Home. 167 tests pass.

**S9 as built (answers: vertical stack of wide cards, text only, same cards on phones, three short lines then the formula):** `philosophy.ts` only. The four points are numbered text cards (01 to 04 in burgundy, title, body) in one column on every width: number beside the text from 761px, stacked on phones. The pictures are no longer shown (`PhilosophyPoint` no longer has image fields; the image files and the `image` fields in `home.ts` are still there, unused). The intro is three short centred lines each with a small burgundy diamond, then the formula and the faith line, wording unchanged. Also done here from item 18: the heading is "Our **Philosophy**" with the capital P and burgundy. Not done: the old pinned deck and carousel dead code in `home.ts`/`home.scss`/`home.html` is still there. 167 tests pass.

**S10 as built (answers: top 5 plus "See all", the first five as they are):** `approach-compare.ts` only, phones and tablets (the pair rows are hidden from 900px; the two panels on large screens are unchanged). The rows show the first 5 pairs; a "See all 12 differences" button (aria-expanded, controls the list) reveals the other 7 (the 12th is the functional-only "Holistic Approach"), and "Show fewer differences" collapses them and keeps the reader in place. 167 tests pass.

**S12 as built (answers: your burgundy table, underline under E.A.S.E in "Transform with E.A.S.E", testimonials styling only, 36 to 56px headings):** (1) New token `--fs-heading: clamp(36px,5vw,56px)`; `.t-display` (all section headings and the page h1s Carol, Deepa, Events) and the Philosophy and Transform titles use it. The hero headline keeps its own size, and the root-map heading stays small (it sits in a compact lead). (2) Global `.accent` (burgundy) in `styles.scss`. Burgundy words applied: hero "Your Body", root map "Telling You", Transform "E.A.S.E" (burgundy with a 3px burgundy underline), Results "YOU transform" (its subtext paragraph is removed), Packages "First Step.", Testimonials "Real Change.", Community "Discover", Events invite "gather", Events page "gathered", Deepa "healing starts from within" and "your soul awakens". (3) Transform container side padding 18px to 20px (+2px; I read "increase"). **Not done and why:** hero/container "+2px" paddings elsewhere (unclear which), text-case audit (headings are Title Case, buttons mixed: "BOOK YOUR CONSULTATION" vs "Book a consultation"), the desktop gap between packages (`.gauge-stack-card` margins of 40vh and 16vh), and the root-map heading size. 167 tests pass.

**S7 first pass (answers: 13-inch MacBook about 1440 to 1470 wide, Safari and Chrome both, "too much empty space between sections"):** I measured every section on Home at 1440x900 (headless Edge; I cannot run Safari). The biggest outlier was the seam between "Our Philosophy" and "Transform with E.A.S.E": about 270px from the last card to the next section's label, against 100 to 190px for the other seams, because both components add their own 72px top and 96px bottom padding on top of the section padding. Fix, only inside `@media (min-width: 1280px) and (max-width: 1728px)` (13, 14 and 16 inch MacBook widths): `.phil` padding-block 32px 24px, `.tl` padding-block 24px. Seam is now about 150px. 1920px is unchanged (measured). Not done: Safari-only differences (100vh, sticky, backdrop-filter) are untested; the pinned root-map section has a long scroll track (about 2000px) which is deliberate; other seams were not changed. 167 tests pass.

## S14 (new request, 2026-10-25): even spacing, logo, divider mix, full-width philosophy
**BUILT, awaiting your manual check, NOT committed.** Answers: dividers = a mix with one common size and spacing; section gap 160px desktop / 110px phone; logo +4px in navbar and footer; philosophy intro and cards at full container width. Mid-turn additions: no divider below the quote; the formula and the faith line are centred.
- **Spacing:** `.scene` in `home.scss` now has `--seam-pad` (47px phones, 72px from 900px up) so a seam is 2 x pad + the divider's net 16px = 110 / 160px. The philosophy and transform components lost their own 72/96px vertical padding, `.hook` uses the same variable, and the MacBook-only override from the S7 first pass is removed (it is no longer needed). Measured at 1440x900 the seams are about 156 to 229px: the spread comes from cards and reveal offsets inside some sections (events invite card, compare panel, reveal wrappers), not from section padding. Phones and 1280/1920 were not re-measured.
- **Logo:** `wordmark.ts` font size +1.8px, so the 2.25em logo is 4px bigger and the name, tagline and gaps scale with it (navbar, footer, close section). Checked at 1440 and 320px wide.
- **Dividers:** two new variants in `section-transition.ts`, `leaves` (five leaves fanned from one point, a lotus shape) and `nodes` (a rail with three dots). All variants are 56px high. Home: no divider under the quote; vine at root-map/none, see list: curtain (root map/philosophy), dots (philosophy/transform), leaves (transform/results), nodes (results/packages), vine (packages/compare), wave (compare/testimonials), sprout (testimonials/community), leaves (community/experts), vine (experts/events). Events page: leaves under the intro, vine between Upcoming and Past.
- **Philosophy:** `.phil` uses the container width and gutters like every other section; heading, intro lines and cards are left-aligned and full width; the formula and "Healing begins..." line are centred. 167 tests pass.

**S14 philosophy redesign (last mid-turn request: "make it look like a proper page people would stop and read"):** `philosophy.ts` rewritten as an editorial layout on the full container width: on 900px and up the title ("Our Philosophy" with a short ember-gradient rule under it) sits on the left beside the three statements, each between hairlines with a burgundy diamond; the formula and "Healing begins..." line are centred alone in a soft parchment band across the full width; then the four numbered cards (number, hairline, title and text). On phones it stacks in the same order. The three statements and the band reveal on scroll. 167 tests pass.
