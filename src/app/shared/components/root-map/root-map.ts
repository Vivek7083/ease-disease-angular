import { AfterViewInit, Component, DestroyRef, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';
import { CtaPill } from '../cta-pill/cta-pill';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';

interface MapNode {
  readonly id: string;
  readonly label: string;
}

interface MapLink {
  readonly from: string;
  readonly to: string;
  /** 'sr' = symptom→condition, 'rt' = condition→root — which layer reveal gates this link's own draw-in, independent of whether it's "lit" (traced). */
  readonly kind: 'sr' | 'rt';
}

// Draft data — an illustrative pattern map, not a clinical claim. The exact
// symptom → condition → root connections here are a starting point for the
// Ease Disease team to review and refine, same as the "not a diagnosis"
// disclaimer already used elsewhere on the page.
const SYMPTOMS: readonly MapNode[] = [
  { id: 'bloat', label: 'Bloating' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'skin', label: 'Skin flare-ups' },
  { id: 'fog', label: 'Brain fog' },
  { id: 'sleep', label: 'Poor sleep' },
  { id: 'cycle', label: 'Cycle changes' },
  { id: 'mood', label: 'Low mood' },
];

const CONDITIONS: readonly MapNode[] = [
  { id: 'inflammation', label: 'Inflammation' },
  { id: 'bloodsugar', label: 'Blood-sugar dips' },
  { id: 'digestion', label: 'Weak digestion' },
  { id: 'nervous', label: 'Nervous system overdrive' },
  { id: 'hormonal', label: 'Hormonal signalling' },
];

// Same four roots as the rest of the page's "rootCauses" content — this map
// is the interactive version of that same claim.
const ROOTS: readonly MapNode[] = [
  { id: 'gut', label: 'Gut imbalance' },
  { id: 'sugar', label: 'Blood-sugar swings' },
  { id: 'hormone', label: 'Hormone imbalance' },
  { id: 'stress', label: 'Chronic stress response' },
];

// Each symptom traces to a single primary condition — two-per-symptom made
// this layer read as a tangle of crossing lines. The convergence (several
// symptoms/conditions meeting at the same root) still happens one layer
// down, which is where the "same roots" point actually needs to land.
const SYMPTOM_TO_CONDITION: Readonly<Record<string, readonly string[]>> = {
  bloat: ['digestion'],
  fatigue: ['bloodsugar'],
  skin: ['inflammation'],
  fog: ['inflammation'],
  sleep: ['nervous'],
  cycle: ['hormonal'],
  mood: ['inflammation'],
};

const CONDITION_TO_ROOT: Readonly<Record<string, readonly string[]>> = {
  inflammation: ['gut', 'hormone'],
  bloodsugar: ['sugar'],
  digestion: ['gut'],
  nervous: ['stress'],
  hormonal: ['hormone', 'stress'],
};

const EXAMPLE_TRACE: ReadonlySet<string> = new Set(['bloat', 'skin']);

const STEP_ACTIVATION_LINE_DESKTOP = 0.55;
const STEP_ACTIVATION_LINE_MOBILE = 0.8;
const DESKTOP_BREAKPOINT = 900;

/**
 * Six beats scrolling past the sticky map, in step with its reveal: the
 * heading, the four narration cards, then the closing "trace your own"
 * card. Same numbering at every breakpoint — desktop lays the map beside
 * this column, mobile stacks it on top, but the beat count and the sync
 * are identical either way.
 */
const BEAT_COUNT = 6;

/** Beats 1-4's own headings, in order — used to build the lead heading's growing "answered" trail, and (desktop) the single active card's own heading. */
const STEP_HEADINGS: readonly string[] = [
  'It starts with what you feel.',
  'Underneath, fewer things are going on.',
  'One level deeper, the lines converge.',
  'Bloating and skin flare-ups seem unrelated.',
];

/** Beats 1-4's own body copy, same order as STEP_HEADINGS. */
const STEP_BODIES: readonly string[] = [
  'Seven everyday complaints. Most people treat each one on its own — a cream for the skin, an antacid for the bloating, coffee for the fatigue.',
  'Many symptoms share the same handful of processes. Inflammation, for one, can surface in the skin, the mood and the gut at once.',
  'Seven symptoms trace back to four places where problems often begin — and most of those paths pass through the gut.',
  "Follow both down and they meet at gut imbalance. That shared root is why treating the skin on its own so often doesn't last.",
];

/**
 * Desktop only: the scroll budget (in vh) for the pinned heading+active-card
 * unit — five "beats" (the master heading settling in, then each of the
 * four narration cards taking its turn) at a comfortable ~70vh of dwell
 * time apiece, enough room to actually read a card before it crossfades
 * into the next one.
 */
const NARRATION_PIN_VH = 340;

/**
 * The interactive root map — symptoms trace down through underlying
 * patterns to the handful of root causes the rest of the page argues for.
 * Sticky map beside (desktop) or above (mobile) a column of narration steps;
 * clicking a symptom re-traces the connecting lines live.
 */
@Component({
  selector: 'app-root-map',
  imports: [CtaPill, EyebrowLabel],
  template: `
    <div class="root-map-grid">
      <div class="root-map-scroll-group">
      @if (isDesktop()) {
        <!-- Desktop: ONE pinned viewport owns the whole heading+active-card
             unit — the same proven pin technique the hook section already
             uses, and the same one .root-map-wrap (the mind-map column)
             already uses successfully right next to this. Earlier attempts
             kept the heading sticky/fixed while separate sibling cards
             scrolled past it in normal flow underneath — that's the "one
             sticky element plus a later normal-flow sibling competing for
             the same reserved space" pattern that kept overlapping no
             matter how it was tuned. With only ONE sticky element and no
             siblings inside its own pin, there's nothing left to compete
             with — which card is showing is just conditional content
             switching inside that one box, not separate boxes taking
             each other's place. -->
        <div class="root-map-narration-pin" #narrationPin [style.height.vh]="narrationPinVh">
          <div class="root-map-narration-viewport">
            <div class="root-map-step root-map-step--lead">
              <app-eyebrow-label text="Where it often starts" />
              <h2 id="root-map-heading" class="root-map-heading">Different symptoms often grow from the same roots.</h2>
              <ul class="root-map-done-trail">
                @for (heading of stepHeadings; track heading; let i = $index) {
                  <li [class.is-shown]="i < activeStep() - 1">{{ heading }}</li>
                }
              </ul>
            </div>
            <!-- All four cards are always in the DOM, stacked in the same
                 CSS grid cell (so the container auto-sizes to whichever is
                 tallest) and crossfaded via opacity/transform — swapping
                 which one is active used to unmount/remount the h3+p
                 outright (@if), which is what made the transition read as
                 an abrupt jump-cut instead of a scroll-driven reveal. -->
            <div class="root-map-active-card">
              @for (heading of stepHeadings; track heading; let i = $index) {
                <div class="root-map-active-card-item" [class.is-active]="activeStep() === i + 1">
                  <h3>{{ heading }}</h3>
                  <p>{{ stepBodies[i] }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <!-- Mobile: plain normal-flow column, no pin — a fixed-height
             sticky/pinned box here has a long history in this component of
             overflowing or fighting the narration around it (see the
             .root-map-wrap comments below), and a phone screen has no
             spare width for a heading to sit beside anything anyway. -->
        <div class="root-map-narration" #narrationContainer>
          <div class="root-map-step root-map-step--lead">
            <app-eyebrow-label text="Where it often starts" />
            <h2 id="root-map-heading" class="root-map-heading">Different symptoms often grow from the same roots.</h2>
            <ul class="root-map-done-trail">
              @for (heading of stepHeadings; track heading; let i = $index) {
                <li [class.is-shown]="i < activeStep() - 1">{{ heading }}</li>
              }
            </ul>
          </div>
          @for (heading of stepHeadings; track heading; let i = $index) {
            <!-- Content always rendered (not @if-gated) so the existing
                 opacity transition below actually gets to fade the text in
                 and out, instead of it popping in the instant the fade
                 finishes. -->
            <article class="root-map-step root-map-narration-card" [class.active]="activeStep() === i + 1">
              <h3>{{ heading }}</h3>
              <p>{{ stepBodies[i] }}</p>
            </article>
          }
        </div>
      }

      <div class="root-map-wrap">
        <div class="root-map" [class.focus]="focusSet().size > 0" #mapBox>
          <svg class="root-map-links" #linksSvg aria-hidden="true">
            @for (link of links; track link.from + '>' + link.to; let i = $index) {
              <path
                pathLength="1"
                [attr.d]="pathData()[i] ?? ''"
                [class.visible]="isLinkVisible(link)"
                [class.lit]="isLinkLit(link)"
                [class.kind-rt]="link.kind === 'rt'"
              />
            }
          </svg>

          <div class="root-map-layer">
            <p class="root-map-layer-label">What you feel</p>
            <div class="root-map-nodes" (pointerdown)="dismissHint()">
              @for (node of symptoms; track node.id; let i = $index) {
                <button
                  type="button"
                  class="root-map-node"
                  [attr.data-id]="node.id"
                  [class.lit]="isLit(node.id)"
                  [class.selected]="selected().has(node.id)"
                  [attr.aria-pressed]="selected().has(node.id)"
                  (click)="toggleSymptom(node.id)"
                >
                  {{ node.label }}
                  <!-- A one-time simulated tap on the first pill — the only
                       hint that these are tappable at all. Dismisses itself
                       once its animation finishes, or the instant the reader
                       actually touches/clicks anything in this row. -->
                  @if (i === 0 && showClickHint() && !reducedMotion()) {
                    <span class="click-hint" aria-hidden="true">
                      <span class="click-hint-ripple"></span>
                      <span class="click-hint-dot" (animationend)="dismissHint()"></span>
                    </span>
                  }
                </button>
              }
            </div>
          </div>

          <div class="root-map-layer" [class.layer-hidden]="!showConditions()">
            <p class="root-map-layer-label root-map-layer-label--conditions">What's really going on</p>
            <div class="root-map-nodes">
              @for (node of conditions; track node.id) {
                <span class="root-map-node root-map-node--static" [attr.data-id]="node.id" [class.lit]="isLit(node.id)">{{ node.label }}</span>
              }
            </div>
          </div>

          <div class="root-map-layer" [class.layer-hidden]="!showRoots()">
            <p class="root-map-layer-label root-map-layer-label--roots">Where it often starts</p>
            <div class="root-map-nodes">
              @for (node of roots; track node.id) {
                <span class="root-map-node root-map-node--root" [attr.data-id]="node.id" [class.lit]="isLit(node.id)">{{ node.label }}</span>
              }
            </div>
          </div>

          <p class="root-map-caption">* This map shows common patterns, not a diagnosis. Please speak to our qualified practitioner for your diagnosis.</p>
        </div>
      </div>
      </div>

      <article class="root-map-step root-map-step--last" [class.active]="activeStep() === 5" #lastContainer>
        <h3>Now trace your own.</h3>
        <p>Tap the symptoms you live with above and watch where they lead.</p>
        <div class="root-map-summary" aria-live="polite">
          @if (selected().size === 0) {
            <p>Tap any symptom above to see where it can lead.</p>
          } @else {
            <p>{{ summaryText() }}</p>
            <ul>
              @for (root of reachedRootNodes(); track root.id) {
                <li>{{ root.label }}</li>
              }
            </ul>
          }
        </div>
        <div class="cta-row">
          <app-cta-pill label="Find my roots in a consultation" variant="primary" (pressed)="bookRequested.emit()" />
          @if (selected().size > 0) {
            <button type="button" class="root-map-clear" (click)="clearSelection()">Clear my symptoms</button>
          }
        </div>
        <p class="root-map-fine">This map shows common patterns, not a diagnosis. Please speak to our qualified practitioner for your diagnosis.</p>
      </article>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Mobile: .root-map-scroll-group is a REAL box wrapping the map + the
       narration, stacked normally (map first). That shared box is what
       gives the sticky map its "room to stick" — it sticks while scrolling
       through the narration beneath it, then releases smoothly and
       continues scrolling away right where the group ends, because that's
       genuinely where its containing block ends. The closing card sits
       *outside* this group entirely, so the map is never on the hook to
       overlap it — there's nothing forcing the two to share space. */
    .root-map-grid {
      display: block;
    }

    .root-map-scroll-group {
      display: block;
    }

    @media (min-width: 900px) {
      /* Desktop: one continuous left-hand column (narration, then the
         closing card sharing the same column via two rows) beside a sticky
         map that spans both those rows. display: contents dissolves the
         scroll-group wrapper here, so the map and the narration become
         direct grid items again — a sticky element's "room to stick" comes
         from its immediate containing block, and a plain (non-contents)
         wrapper div would shrink-wrap to the sticky child's own height
         instead of the full narration+last span it needs on this layout. */
      .root-map-scroll-group {
        display: contents;
      }
      .root-map-grid {
        display: grid;
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
        gap: var(--sp-12);
        align-items: start;
      }
      .root-map-narration-pin {
        grid-column: 1;
        grid-row: 1;
      }
      .root-map-step--last {
        grid-column: 1;
        grid-row: 2;
      }
      .root-map-wrap {
        grid-column: 2;
        grid-row: 1 / 3;
        position: sticky;
        top: 0;
        height: 100vh;
        padding-block: var(--sp-8);
      }
    }

    /* Mobile: no sticky, no fixed height, no background — just a plain
       block sitting after the narration and before the closing card, sized
       to whatever its (fully-revealed) content actually needs. A fixed-height
       sticky box here kept overflowing into the narration no matter how far
       it was stretched or how compact the pills got — three full layers of
       pills plus the connecting lines just don't fit in a partial-viewport
       box on a small screen. Letting it take its natural height removes the
       constraint that was causing the overlap in the first place. */
    .root-map-wrap {
      display: flex;
      align-items: center;
      padding-block: var(--sp-8);
    }

    .root-map {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--sp-10);
    }

    .root-map-links {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    /* Every link between two *revealed* layers draws in faintly on its own —
       this is the map's actual illustration, the thing that makes it read
       as "roots" rather than three unrelated rows of pills. The .lit class is a
       brighter highlight layered on top for whichever path is currently
       traced (hover/select/example), not a gate on visibility itself.
       pathLength="1" (set in the template) means dasharray/dashoffset of 1
       always mean "whole path", regardless of each path's real pixel
       length, so one dashoffset transition draws every link in evenly. */
    .root-map-links path {
      fill: none;
      stroke: color-mix(in oklab, var(--oxblood) 26%, transparent);
      stroke-width: 1.4;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      transition:
        stroke-dashoffset 1.1s var(--ease),
        stroke var(--dur-base) var(--ease),
        stroke-width var(--dur-base) var(--ease),
        opacity var(--dur-base) var(--ease);
    }

    .root-map-links path.visible {
      stroke-dashoffset: 0;
    }

    /* Colored by which layer the link is arriving at, not which it leaves —
       symptom→condition traces end in olive, condition→root traces end in
       burgundy, echoing the same terracotta/olive/oxblood layering the
       nodes themselves use below. */
    .root-map-links path.lit {
      stroke: var(--olive);
      stroke-width: 2.2;
    }

    .root-map-links path.lit.kind-rt {
      stroke: var(--oxblood);
    }

    .root-map.focus .root-map-links path.visible:not(.lit) {
      opacity: 0.3;
    }

    .root-map.focus .root-map-node:not(.lit):not(.selected) {
      opacity: 0.45;
    }

    .root-map-layer {
      position: relative;
      z-index: 1;
      transition:
        opacity var(--dur-scene) var(--ease-out-soft),
        transform var(--dur-scene) var(--ease-out-soft);
    }

    .root-map-layer.layer-hidden {
      opacity: 0;
      transform: translateY(10px);
    }

    .root-map-layer-label {
      margin-bottom: var(--sp-3);
      text-align: center;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--text-quiet-light);
    }

    /* Each layer caption picks up a whisper of its own layer's color
       (olive/burgundy), matching the nodes and links beneath it — just
       enough to read as a hint of that layer's identity, not a loud label. */
    .root-map-layer-label--conditions {
      color: color-mix(in oklab, var(--olive) 55%, var(--text-quiet-light));
    }

    .root-map-layer-label--roots {
      color: color-mix(in oklab, var(--oxblood) 55%, var(--text-quiet-light));
    }

    .root-map-nodes {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--sp-2);
    }

    .root-map-node {
      position: relative;
      display: inline-flex;
      align-items: center;
      min-height: 38px;
      padding: 0 var(--sp-4);
      border-radius: var(--r-pill);
      border: 1px solid color-mix(in oklab, var(--oxblood) 30%, transparent);
      background: color-mix(in oklab, var(--oxblood) 6%, var(--ivory));
      color: var(--oxblood-deep);
      font-family: var(--font-body);
      font-size: 0.92rem;
      cursor: default;
      transition:
        background var(--dur-base) var(--ease),
        border-color var(--dur-base) var(--ease),
        color var(--dur-base) var(--ease),
        opacity var(--dur-base) var(--ease);
    }

    /* One-time simulated tap on the first pill — approaches, presses down
       (a ripple confirms the "click"), then fades for good. Dismissed on
       animation end or the instant the reader touches/clicks anything in
       the row (see dismissHint in root-map.ts). */
    .click-hint {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .click-hint-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--oxblood);
      animation: click-hint-press 2.4s var(--ease-out-soft) both;
    }
    .click-hint-ripple {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1.5px solid var(--oxblood);
      animation: click-hint-ripple 2.4s var(--ease-out-soft) both;
    }
    @keyframes click-hint-press {
      0% {
        transform: translateY(-16px) scale(1);
        opacity: 0;
      }
      20% {
        opacity: 0.9;
      }
      40% {
        transform: translateY(-16px) scale(1);
        opacity: 0.9;
      }
      55% {
        transform: translateY(0) scale(1);
        opacity: 0.9;
      }
      65% {
        transform: translateY(0) scale(0.6);
        opacity: 0.9;
      }
      78% {
        transform: translateY(0) scale(1);
        opacity: 0.9;
      }
      100% {
        transform: translateY(0) scale(1);
        opacity: 0;
      }
    }
    @keyframes click-hint-ripple {
      0%,
      58% {
        opacity: 0;
        transform: scale(0.6);
      }
      65% {
        opacity: 0.5;
      }
      100% {
        opacity: 0;
        transform: scale(3.2);
      }
    }

    button.root-map-node {
      cursor: pointer;
      min-height: 44px;
    }

    button.root-map-node:hover {
      border-color: var(--oxblood);
    }

    /* Conditions layer — the middle "what's really going on" row — carries
       its own olive tint even at rest, so the three layers read as three
       distinct depths rather than one repeated style. */
    .root-map-node--static {
      border-color: color-mix(in oklab, var(--olive) 40%, transparent);
    }

    .root-map-node--root {
      font-family: var(--font-display);
      font-size: 1.02rem;
      min-height: 44px;
      padding: 0 var(--sp-5);
      border-color: color-mix(in oklab, var(--oxblood) 45%, transparent);
    }

    /* Default (symptoms layer, the buttons) lights up terracotta — the
       warmest, most immediate tone, for the layer the reader interacts
       with directly. */
    .root-map-node.lit {
      background: var(--terracotta);
      border-color: var(--terracotta);
      color: var(--ivory);
    }

    /* Conditions and roots each light up in their own layer color instead
       of all three converging on the same terracotta — olive for the
       processes underneath, burgundy for the roots underneath that. */
    .root-map-node--static.lit {
      background: var(--olive);
      border-color: var(--olive);
    }

    .root-map-node--root.lit {
      background: var(--oxblood);
      border-color: var(--oxblood);
    }

    .root-map-node.selected {
      background: var(--oxblood);
      border-color: var(--oxblood);
      color: var(--ivory);
    }

    /* Only on larger screens, where the sticky map has its own dedicated
       column and room underneath the roots layer for a quiet caption. On
       mobile the map's box is already tight (see the <900px overflow fix
       above), and the same line already appears at the end of the steps. */
    .root-map-caption {
      display: none;
    }

    @media (min-width: 900px) {
      .root-map-caption {
        display: block;
        margin-top: var(--sp-3);
        text-align: center;
        font-size: 9px;
        line-height: 1.5;
        letter-spacing: 0.01em;
        color: color-mix(in oklab, var(--text-quiet-light) 70%, transparent);
      }
    }

    /* Mobile only (the un-pinned plain column — see the template's
       @if (isDesktop())). */
    .root-map-narration {
      position: relative;
      z-index: 1;
    }

    /* Desktop only — the pinned heading+active-card unit. Same shape as
       .hook-pin/.hook-viewport in home.scss and .root-map-wrap right next
       to this: a tall pin whose own height is nothing but scroll budget,
       holding ONE sticky viewport. That's the whole fix over the earlier
       version — there is nothing else inside .root-map-narration-pin for
       the sticky viewport to conflict with, so there's no "later sibling"
       for it to lose a stacking fight against. */
    .root-map-narration-pin {
      position: relative;
      z-index: 1;
    }

    .root-map-narration-viewport {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-block: var(--sp-8);
    }

    /* The card currently taking its turn — deliberately NOT reusing
       .root-map-step here: that class's min-height/opacity dimming exists
       for mobile's stack of separate, individually-scrolling cards, which
       has no equivalent concept here (this is the only card on screen,
       vertically centered by .root-map-narration-viewport itself).
       display:grid with every item placed in the same cell (below) stacks
       all four on top of each other and auto-sizes the container to
       whichever is tallest — no fixed/guessed height needed for the
       crossfade to work. */
    .root-map-active-card {
      display: grid;
      margin-top: var(--sp-10);
    }

    .root-map-active-card-item {
      grid-area: 1 / 1;
      opacity: 0;
      transform: translateY(16px);
      pointer-events: none;
      transition:
        opacity var(--dur-scene) var(--ease-out-soft),
        transform var(--dur-scene) var(--ease-out-soft);
    }

    .root-map-active-card-item.is-active {
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }

    .root-map-active-card-item h3 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(1.5rem, 1.2rem + 1.4vw, 2.1rem);
      line-height: 1.15;
      color: var(--ink);
      max-width: 18ch;
    }

    .root-map-active-card-item p {
      margin-top: var(--sp-4);
      color: var(--text-quiet-light);
      line-height: var(--lh-body);
      max-width: 42ch;
    }

    /* .root-map-step (below) gives .root-map-step--lead a 70vh min-height
       at >=900px too, sized for when it was one of several full-height
       siblings taking turns in normal flow. Inside the new pinned viewport
       it's sharing a single 100vh box with the active card, so that same
       70vh would force the two to fight over — and likely overflow — the
       box's real height. Cancelled specifically for this context only;
       mobile's .root-map-step--lead (inside plain .root-map-narration) is
       untouched. */
    .root-map-narration-viewport .root-map-step--lead {
      min-height: 0;
    }

    /* A plain, normal-flow block — always fully legible (never fades like
       the narration cards below it), but no longer pinned/sticky in any
       way. Both CSS position:sticky and a hand-rolled JS position:fixed pin
       were tried here and both still let this heading's text visibly
       overlap the active narration card below it in this particular grid +
       display:contents layout, so the "stays in place while scrolling"
       behaviour was dropped entirely — a plain block-flow sibling can never
       overlap another one, which is what actually guarantees this can't
       recur. */
    .root-map-step--lead {
      opacity: 1;
      padding-bottom: var(--sp-6);
    }

    /* Noticeably smaller than before, and no longer force-wrapped onto
       three lines (that max-width was most of why this heading dominated
       the whole screen) — it still reads as the section's title, just
       without eating the space the active card underneath needs. */
    .root-map-heading {
      margin-top: var(--sp-2);
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(1.4rem, 1.1rem + 1.2vw, 1.9rem);
      line-height: 1.2;
      color: var(--ink);
      max-width: 30ch;
    }

    /* The "answered" trail lives INSIDE the sticky lead box itself (a
       sticky element simply growing its own content as more lines are
       added is ordinary, safe behaviour in theory) — but ALL FOUR slots
       are always present, reserving their final space from the very first
       frame, and only fade in as each beat is passed. A sticky box that
       changes its OWN height while it's already stuck does not reliably
       push the following siblings down in every layout — this one has a
       CSS grid ancestor with a display:contents wrapper in between, which
       is exactly the combination that can silently fail to do that — so
       the box's total height simply never changes at all, sidestepping
       the whole class of bug rather than depending on that recalculation.
       Putting this same text in a *sibling* that shrinks down next to the
       sticky box (an earlier version of this) hit the same failure from
       the other direction. */
    .root-map-done-trail {
      margin: var(--sp-3) 0 0;
      padding: var(--sp-3) 0 0;
      border-top: 1px solid var(--rule-on-light);
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
    }

    .root-map-done-trail li {
      font-family: var(--font-display);
      font-size: 0.9rem;
      font-weight: 500;
      color: color-mix(in oklab, var(--ink) 60%, transparent);
      opacity: 0;
      transform: translateY(-4px);
      transition:
        opacity var(--dur-base) var(--ease),
        transform var(--dur-base) var(--ease);
    }

    .root-map-done-trail li.is-shown {
      opacity: 1;
      transform: none;
    }

    /* Each narration "slot" reserves the same fixed scroll distance
       regardless of state (mobile: this is a plain block, not pinned — see
       .root-map-narration above), so there's nothing here that can
       grow/shrink/overlap. */
    .root-map-step {
      min-height: 56vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      opacity: 0.4;
      transition: opacity var(--dur-base) var(--ease);
    }

    /* Mobile only — a touch of rise alongside the existing opacity fade, so
       the card reads as scrolling/settling into place rather than just
       dimming up in position. Scoped to a dedicated class (not the base
       .root-map-step rule) so it doesn't also apply to the lead heading or
       the closing card, neither of which should ever sit offset. */
    .root-map-narration-card {
      transform: translateY(14px);
      transition:
        opacity var(--dur-base) var(--ease),
        transform var(--dur-base) var(--ease);
    }

    .root-map-narration-card.active {
      transform: none;
    }

    @media (min-width: 900px) {
      .root-map-step {
        min-height: 70vh;
      }

      /* Nudged up rather than dead-centered — this is the card most likely
         to sit right alongside the fully-lit trace (bloat/skin → gut/
         hormone), and centered it read as sitting a little low against it. */
      .root-map-step--raise {
        padding-bottom: 10vh;
      }
    }

    .root-map-step.active {
      opacity: 1;
    }

    .root-map-step h3 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(1.5rem, 1.2rem + 1.4vw, 2.1rem);
      line-height: 1.15;
      color: var(--ink);
      max-width: 18ch;
    }

    .root-map-step p {
      margin-top: var(--sp-4);
      color: var(--text-quiet-light);
      line-height: var(--lh-body);
      max-width: 42ch;
    }

    /* Centered like every other card (min-height + justify-content:center
       from .root-map-step), not left to sit wherever its own auto content
       height happens to land — it was reading noticeably higher/lower than
       the narration cards above it. Extra scroll room on top of that
       (min-height bumped past the other cards', plus more bottom padding)
       so this closing beat doesn't feel like it ends the moment it arrives. */
    .root-map-step--last {
      padding-block: var(--sp-8) var(--sp-20);
    }

    @media (min-width: 900px) {
      .root-map-step--last {
        min-height: 120vh;
      }
    }

    /* Mobile: the map is height-constrained again (sticky at the top of the
       single column), and the pills/layer gaps read as comfortably compact
       rather than desktop-sized on a narrow screen. Steps are top-aligned
       instead of centered in their tall min-height box, since centering is
       the *cross* axis for a row-flex step and the *main* axis here (the
       step is column-flex) — align-items would have centered nothing and
       silently no-op'd, same class of axis bug fixed earlier in .hook. */
    @media (max-width: 899px) {
      .root-map {
        gap: 30px;
      }

      .root-map-node {
        font-size: 0.8rem;
        padding: 0 10px;
        min-height: 30px;
      }

      button.root-map-node {
        min-height: 36px;
      }

      .root-map-node--root {
        font-size: 0.88rem;
        min-height: 34px;
        padding: 0 12px;
      }

      .root-map-layer-label {
        font-size: 0.72rem;
        margin-bottom: 6px;
      }

      .root-map-nodes {
        gap: 6px;
      }

      .root-map-step {
        min-height: 50vh;
        justify-content: flex-start;
        padding-top: 3vh;
      }

      .root-map-step--lead {
        padding-top: 5vh;
      }

      .root-map-step--last {
        padding-block: var(--sp-6) 14vh;
      }

      .root-map-wrap {
        padding-block: var(--sp-6);
      }
    }

    .root-map-summary {
      margin-top: var(--sp-5);
      min-height: 3.2em;
    }

    .root-map-summary p {
      color: var(--ink);
    }

    .root-map-summary ul {
      margin: var(--sp-3) 0 0;
      padding: 0;
      list-style: none;
    }

    .root-map-summary li {
      padding: var(--sp-2) 0;
      border-top: 1px solid var(--rule-on-light);
      color: var(--text-quiet-light);
    }

    .cta-row {
      margin-top: var(--sp-6);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--sp-4);
    }

    .root-map-clear {
      min-height: 44px;
      padding: 0 var(--sp-4);
      border-radius: var(--r-pill);
      background: transparent;
      color: var(--oxblood-deep);
      border: 1px solid color-mix(in oklab, var(--oxblood) 40%, transparent);
      font-family: var(--font-body);
      font-size: 0.9rem;
      cursor: pointer;
    }

    .root-map-fine {
      margin-top: var(--sp-8);
      font-size: 0.82rem;
      color: var(--text-quiet-light);
      max-width: 46ch;
    }

    @media (prefers-reduced-motion: reduce) {
      .root-map-links path,
      .root-map-layer,
      .root-map-node,
      .root-map-step,
      .root-map-narration-card,
      .root-map-active-card-item,
      .root-map-done-trail li {
        transition: none;
      }
    }
  `,
})
export class RootMap implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly symptoms = SYMPTOMS;
  protected readonly conditions = CONDITIONS;
  protected readonly roots = ROOTS;

  protected readonly showClickHint = signal(true);
  protected readonly reducedMotion = signal(this.readReducedMotion());

  protected dismissHint(): void {
    this.showClickHint.set(false);
  }

  private readReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => this.reducedMotion.set(motionQuery.matches);
    motionQuery.addEventListener('change', onMotionChange);
    this.destroyRef.onDestroy(() => motionQuery.removeEventListener('change', onMotionChange));

    // Fallback in case `animationend` never fires — the hint is a one-time
    // nudge, not something that should linger indefinitely either way.
    const dismissTimer = window.setTimeout(() => this.dismissHint(), 2600);
    this.destroyRef.onDestroy(() => window.clearTimeout(dismissTimer));
  }

  protected readonly links: readonly MapLink[] = [
    ...Object.entries(SYMPTOM_TO_CONDITION).flatMap(([from, tos]) => tos.map((to) => ({ from, to, kind: 'sr' as const }))),
    ...Object.entries(CONDITION_TO_ROOT).flatMap(([from, tos]) => tos.map((to) => ({ from, to, kind: 'rt' as const }))),
  ];

  readonly bookRequested = output<void>();

  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly activeStep = signal(0);

  /** The four narration beats' own headings — rendered inside the lead heading's trail, each revealed once its beat is passed. */
  protected readonly stepHeadings = STEP_HEADINGS;
  protected readonly stepBodies = STEP_BODIES;
  protected readonly narrationPinVh = NARRATION_PIN_VH;

  // Desktop syncs the reveal to the narration scrolling past the sticky
  // map. Mobile has no sticky map to sync against any more (a fixed-height
  // sticky box there kept overflowing no matter how compact the layers
  // got), but the reveal-as-you-scroll effect still matters on its own —
  // so on mobile it's driven by the map's own position as it scrolls
  // through the viewport instead, via mobileConditionsVisible/RootsVisible.
  protected readonly isDesktop = signal(false);
  private readonly mobileConditionsVisible = signal(false);
  private readonly mobileRootsVisible = signal(false);

  protected readonly focusSet = computed<ReadonlySet<string>>(() => {
    if (this.selected().size > 0) {
      return this.selected();
    }
    return this.isDesktop() && this.activeStep() === 4 ? EXAMPLE_TRACE : new Set();
  });

  protected readonly reachedConditionIds = computed(() => {
    const reached = new Set<string>();
    for (const id of this.focusSet()) {
      for (const c of SYMPTOM_TO_CONDITION[id] ?? []) {
        reached.add(c);
      }
    }
    return reached;
  });

  protected readonly reachedRootIds = computed(() => {
    const reached = new Set<string>();
    for (const id of this.reachedConditionIds()) {
      for (const r of CONDITION_TO_ROOT[id] ?? []) {
        reached.add(r);
      }
    }
    return reached;
  });

  protected readonly reachedRootNodes = computed(() => this.roots.filter((r) => this.reachedRootIds().has(r.id)));

  // Desktop reveals conditions/roots in step with the narration scrolling
  // past the sticky map (beats: 0 heading, 1-4 narration, 5 closing).
  // Mobile reveals them as the map itself scrolls through the viewport —
  // see updateMobileMapReveal.
  protected readonly showConditions = computed(
    () => this.selected().size > 0 || (this.isDesktop() ? this.activeStep() >= 2 : this.mobileConditionsVisible()),
  );
  protected readonly showRoots = computed(
    () => this.selected().size > 0 || (this.isDesktop() ? this.activeStep() >= 3 : this.mobileRootsVisible()),
  );

  protected readonly summaryText = computed(() => {
    const n = this.selected().size;
    const rootCount = this.reachedRootNodes().length;
    if (n === 0 || rootCount === 0) {
      return '';
    }
    return `${n} symptom${n > 1 ? 's' : ''} can trace back to ${rootCount} possible root${rootCount > 1 ? 's' : ''}.`;
  });

  private readonly mapBox = viewChild<ElementRef<HTMLElement>>('mapBox');
  private readonly linksSvg = viewChild<ElementRef<SVGSVGElement>>('linksSvg');
  /** Mobile only — the plain, un-pinned narration column. */
  private readonly narrationContainer = viewChild<ElementRef<HTMLElement>>('narrationContainer');
  /** Desktop only — the pinned heading+active-card unit (see updateActiveStep). */
  private readonly narrationPin = viewChild<ElementRef<HTMLElement>>('narrationPin');
  private readonly lastContainer = viewChild<ElementRef<HTMLElement>>('lastContainer');

  protected readonly pathData = signal<readonly string[]>([]);

  private layoutRaf = 0;
  private scrollRaf = 0;

  protected isLit(id: string): boolean {
    return this.focusSet().has(id) || this.reachedConditionIds().has(id) || this.reachedRootIds().has(id);
  }

  protected isLinkVisible(link: MapLink): boolean {
    return link.kind === 'sr' ? this.showConditions() : this.showRoots();
  }

  protected isLinkLit(link: MapLink): boolean {
    return this.isLit(link.from) && this.isLit(link.to);
  }

  protected toggleSymptom(id: string): void {
    this.dismissHint();
    const next = new Set(this.selected());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selected.set(next);
    this.queueLayout();
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
    this.queueLayout();
  }

  ngAfterViewInit(): void {
    const onScroll = () => {
      if (this.scrollRaf) {
        return;
      }
      this.scrollRaf = requestAnimationFrame(() => {
        this.scrollRaf = 0;
        this.updateActiveStep();
        this.updateMobileMapReveal();
      });
    };
    const onResize = () => {
      this.updateActiveStep();
      this.updateMobileMapReveal();
      this.queueLayout();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    let resizeObserver: ResizeObserver | undefined;
    const mapEl = this.mapBox()?.nativeElement;
    if (mapEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => this.queueLayout());
      resizeObserver.observe(mapEl);
    }

    this.updateActiveStep();
    this.updateMobileMapReveal();
    this.queueLayout();

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(this.scrollRaf);
      cancelAnimationFrame(this.layoutRaf);
      resizeObserver?.disconnect();
    });
  }

  /**
   * On mobile, the map has no sticky column to sync its reveal against —
   * it's a plain block, so instead the reveal is driven by how far the map
   * itself has scrolled through the viewport: conditions unlock once its
   * top third has passed the activation line, roots once two-thirds have.
   * A one-time "did this flip" check (not a plain re-set every frame) is
   * what gates queueLayout — the link paths only need recomputing when a
   * layer's hidden/shown state actually changes, not on every scroll pixel.
   */
  private updateMobileMapReveal(): void {
    if (this.isDesktop()) {
      return;
    }
    const mapEl = this.mapBox()?.nativeElement;
    if (!mapEl) {
      return;
    }
    const rect = mapEl.getBoundingClientRect();
    const line = window.innerHeight * STEP_ACTIVATION_LINE_MOBILE;
    const progress = Math.max(0, Math.min(1, (line - rect.top) / rect.height));

    const conditionsVisible = progress >= 0.3;
    const rootsVisible = progress >= 0.65;

    if (conditionsVisible !== this.mobileConditionsVisible() || rootsVisible !== this.mobileRootsVisible()) {
      this.mobileConditionsVisible.set(conditionsVisible);
      this.mobileRootsVisible.set(rootsVisible);
      this.queueLayout();
    }
  }

  private queueLayout(): void {
    if (this.layoutRaf) {
      return;
    }
    this.layoutRaf = requestAnimationFrame(() => {
      this.layoutRaf = 0;
      this.layout();
    });
  }

  private layout(): void {
    const mapEl = this.mapBox()?.nativeElement;
    const svg = this.linksSvg()?.nativeElement;
    if (!mapEl || !svg) {
      return;
    }
    const box = mapEl.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);

    const paths = this.links.map((link) => {
      const elA = mapEl.querySelector<HTMLElement>(`[data-id="${link.from}"]`);
      const elB = mapEl.querySelector<HTMLElement>(`[data-id="${link.to}"]`);
      if (!elA || !elB) {
        return '';
      }
      const a = elA.getBoundingClientRect();
      const b = elB.getBoundingClientRect();
      const x1 = a.left + a.width / 2 - box.left;
      const y1 = a.bottom - box.top;
      const x2 = b.left + b.width / 2 - box.left;
      const y2 = b.top - box.top;
      const midY = (y1 + y2) / 2;
      return `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
    });

    this.pathData.set(paths);
  }

  /**
   * Which "beat" is active — computed completely differently per
   * breakpoint, because the two use genuinely different DOM structures now
   * (see the template's @if (isDesktop())).
   *
   * Desktop: the heading+active-card unit lives inside ONE pinned viewport
   * (.root-map-narration-pin), the same technique as the hook section's own
   * pin — so "which beat" is just that pin's own scroll progress (0..1)
   * split into 5 equal shares (the lead settling in, then each of the 4
   * cards), plus a beat 5 once the pin has fully released and the separate
   * closing card comes into view. This replaced an earlier version that
   * measured each narration card's own live position individually while
   * they scrolled past a sticky heading as separate siblings — that
   * approach could never reliably keep the heading stacked above them (see
   * the git history for this file if curious), so there's no per-card
   * measurement left to get wrong.
   *
   * Mobile: unchanged from before — narration is a plain, un-pinned column,
   * so a single progress fraction spanning narration+closing, divided
   * evenly across all six beats, tracks the activation line crossing each
   * card accurately (mobile's cards are all the same height, so an even
   * 1/6th split lines up with reality).
   */
  private updateActiveStep(): void {
    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    if (isDesktop !== this.isDesktop()) {
      this.isDesktop.set(isDesktop);
    }

    let active: number;
    if (isDesktop) {
      const pinEl = this.narrationPin()?.nativeElement;
      if (!pinEl) {
        return;
      }
      const viewportHeight = window.innerHeight;
      const rect = pinEl.getBoundingClientRect();

      if (rect.top > 0) {
        active = 0;
      } else if (rect.bottom <= viewportHeight) {
        const line = viewportHeight * STEP_ACTIVATION_LINE_DESKTOP;
        const lastRect = this.lastContainer()?.nativeElement.getBoundingClientRect();
        active = lastRect && lastRect.top <= line ? BEAT_COUNT - 1 : BEAT_COUNT - 2;
      } else {
        const scrollable = rect.height - viewportHeight;
        const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
        active = Math.min(BEAT_COUNT - 2, Math.floor(progress * (BEAT_COUNT - 1)));
      }
    } else {
      const narrationEl = this.narrationContainer()?.nativeElement;
      if (!narrationEl || narrationEl.clientHeight === 0) {
        return;
      }
      const line = window.innerHeight * STEP_ACTIVATION_LINE_MOBILE;
      const narrationRect = narrationEl.getBoundingClientRect();
      const top = narrationRect.top;
      const lastRect = this.lastContainer()?.nativeElement.getBoundingClientRect();
      const bottom = lastRect ? lastRect.bottom : narrationRect.bottom;
      const progress = Math.max(0, Math.min(1, (line - top) / (bottom - top)));
      active = Math.min(BEAT_COUNT - 1, Math.floor(progress * BEAT_COUNT));
    }

    if (active !== this.activeStep()) {
      this.activeStep.set(active);
      this.queueLayout();
    }
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
