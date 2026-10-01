# Results section: items that need review before launch

Date: 2026-10-02
Component: `src/app/shared/components/results/` (placed after Treat, before Root Map in `home.html`)

## 1. LAUNCH BLOCKER: stand-in testimonial is invented

- The quote card currently shows an **invented** quote attributed to "Priya Sharma, Mumbai".
- No real person said this. It exists only so the layout, quote length and typography can be judged.
- No client testimonials have been supplied yet (content doc: "No testimonials are included").
- **Action:** replace it with a real quote, from a real client who has given written consent, before the site goes live. Publishing it as genuine would be a fabricated review.
- **How:** edit the single `TESTIMONIAL` object in `results.ts` (quote, name, context) and set `isPlaceholder: false`. The template needs no other change.
- **Find it later:** `grep -r "isPlaceholder" src` or look for `data-placeholder="true"` in the rendered DOM.
- The quote deliberately describes feelings only (bloating, energy, understanding). It makes no medical outcome claims. Keep the real one the same way, or have it reviewed first.

## 2. Outcome wording needs clinical and legal review

The six outcomes are paraphrased from PRD §4, softened to "can" or "many people" rather than promises. Please have Dr. Akshai and a legal advisor check them, particularly:

- **"Less reliance on medication: with your doctor, many people can step down what they once thought was for life."** The PRD says "reduced dependence on lifelong medications". India's advertising rules restrict treatment claims for some diseases. Consider removing or softening this line if in doubt.
- **"Numbers in their optimal range."** The wording rests on "optimal ranges" rather than standard lab ranges. Confirm the practice is comfortable with it.
- **"Balanced mood and hormones" and "cycles that settle."** These are outcome claims. Confirm they are acceptable.

## 3. Copy written by Claude, not from the founders

These lines are not in the PRD or content doc and need founder sign-off:

- Heading: "What changes when the cause is found."
- Eyebrow: "After the work"
- Intro: "Not just a quieter symptom. A body that is getting what it needs, and a person who knows how to keep it that way."
- The one-line description under each outcome title.

## 4. Open design and product questions

- The PRD also lists a **Community section with testimonials and a member count** (§9). That is separate from this results quote and not built yet.
- The PRD's quote "Right knowledge + right action = optimum health. Healing begins the moment you choose faith over fear." is the practice motto, not a client quote. It is not used in this section.
- Mobile uses a light scroll reveal with no pin, deliberately calmer after two pinned sections. Revisit if you want more motion.
- Real devices have not been tested. The section was checked only in headless Chromium at 390px and 1440px.
