import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { ConditionNoteCard } from '../conditions-board/condition-note';
import { ConditionsBoard } from '../conditions-board/conditions-board';
import { NOTES } from '../conditions-board/conditions-data';
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

// Draft data — an illustrative pattern map, not a clinical claim. Top layer
// is the seven families the PRD's condition list folds into (the full list
// lives on the notes in app-conditions-board); the bottom layer is a single
// root — minerals & vitamin deficiencies — per the PRD. The middle layer
// is deliberately short. For the Ease Disease team to review and refine,
// same as the "not a diagnosis" disclaimer used elsewhere on the page.
const SYMPTOMS: readonly MapNode[] = [
  { id: 'gut', label: 'Gut & digestion' },
  { id: 'immune', label: 'Immune, thyroid & joints' },
  { id: 'skin', label: 'Skin' },
  { id: 'sugar', label: 'Blood sugar & heart' },
  { id: 'hormones', label: "Hormones & women's health" },
  { id: 'fertility', label: 'Fertility & motherhood' },
  { id: 'brain', label: 'Brain, sleep & mood' },
];

// Listed in the same left-to-right order as the families that feed them, so
// the connecting curves stay short and don't cross. No mechanism takes more
// than two families.
const CONDITIONS: readonly MapNode[] = [
  { id: 'digestion', label: 'Weak digestion' },
  { id: 'inflammation', label: 'Inflammation' },
  { id: 'bloodsugar', label: 'Blood-sugar swings' },
  { id: 'hormonal', label: 'Hormonal signalling' },
  { id: 'nervous', label: 'Stress & nervous system' },
];

// One root for everything — the point of the map is that the lines converge.
const ROOTS: readonly MapNode[] = [{ id: 'deficiency', label: 'Minerals & vitamin deficiencies' }];

// Each family traces to a single mechanism.
const SYMPTOM_TO_CONDITION: Readonly<Record<string, readonly string[]>> = {
  gut: ['digestion'],
  immune: ['inflammation'],
  skin: ['inflammation'],
  sugar: ['bloodsugar'],
  hormones: ['hormonal'],
  fertility: ['hormonal'],
  brain: ['nervous'],
};

const CONDITION_TO_ROOT: Readonly<Record<string, readonly string[]>> = {
  digestion: ['deficiency'],
  inflammation: ['deficiency'],
  bloodsugar: ['deficiency'],
  hormonal: ['deficiency'],
  nervous: ['deficiency'],
};

const STEP_ACTIVATION_LINE_MOBILE = 0.8;
const DESKTOP_BREAKPOINT = 900;

/** Large screens: the notes pinned around the map, in PRD order — three each side — and everything after them behind "see more". */
const PINNED_NOTE_COUNT = 6;
const PINNED_NOTES = NOTES.slice(0, PINNED_NOTE_COUNT);
const MORE_NOTES = NOTES.slice(PINNED_NOTE_COUNT);
const LEFT_NOTES = PINNED_NOTES.filter((_, i) => i % 2 === 0);
const RIGHT_NOTES = PINNED_NOTES.filter((_, i) => i % 2 === 1);
const PINNED_ORDER: Readonly<Record<string, number>> = Object.fromEntries(PINNED_NOTES.map((note, i) => [note.id, i]));

/**
 * Desktop scroll budget for the pinned stage: 100vh is the pin itself, the
 * rest (190vh, under the project's 200vh pin limit) is scroll while pinned.
 * Notes arrive one by one between NOTES_START and the end of that scroll,
 * each taking NOTES_STEP of it, with a little dwell left after the last.
 */
const DESKTOP_PIN_VH = 290;
const NOTES_START = 0.08;
const NOTES_STEP = 0.14;

/**
 * The interactive root map. Families of conditions trace down through the
 * mechanisms behind them to one root — minerals and vitamin deficiencies.
 * Large screens: the map sits pinned in the centre while the PRD's condition
 * notes pin themselves around it, one by one, as you scroll. Mobile: the
 * map, then a column of the same notes. Both end on the same "fact" block
 * that names the common root and leads to booking.
 */
@Component({
  selector: 'app-root-map',
  imports: [NgTemplateOutlet, ScrollRevealDirective, ConditionNoteCard, ConditionsBoard, CtaPill, EyebrowLabel],
  template: `
    <!-- The map itself, declared once and placed by whichever layout is
         showing — pinned in the centre stage on large screens, in plain
         flow on mobile. -->
    <ng-template #mapTpl>
      <div class="root-map-wrap">
        <div class="root-map" [class.focus]="selected().size > 0" #mapBox>
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
            <p class="root-map-layer-label">Conditions we treat</p>
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
            <p class="root-map-layer-label root-map-layer-label--conditions">How it shows up</p>
            <div class="root-map-nodes">
              @for (node of conditions; track node.id) {
                <span class="root-map-node root-map-node--static" [attr.data-id]="node.id" [class.lit]="isLit(node.id)">{{ node.label }}</span>
              }
            </div>
          </div>

          <div class="root-map-layer" [class.layer-hidden]="!showRoots()">
            <p class="root-map-layer-label root-map-layer-label--roots">Why it happens</p>
            <div class="root-map-nodes">
              @for (node of roots; track node.id) {
                <span class="root-map-node root-map-node--root" [attr.data-id]="node.id" [class.lit]="isLit(node.id)">{{ node.label }}</span>
              }
            </div>
          </div>

          <p class="root-map-caption">* This map shows common patterns, not a diagnosis. Please speak to our qualified practitioner for your diagnosis.</p>
        </div>
      </div>
    </ng-template>

    @if (isDesktop()) {
      <!-- Large screens: ONE pinned viewport holds the heading, the map and
           the notes. Which notes are showing is just their opacity/rise
           following scroll progress — nothing is added or removed, so
           scrolling back up un-pins them in reverse. -->
      <div class="rm-pin" #deskPin [style.height.vh]="deskPinVh">
        <div class="rm-viewport">
          <header class="rm-head">
            <app-eyebrow-label text="Conditions we treat" />
            <h2 id="root-map-heading" class="root-map-heading">Symptoms and conditions we treat at the root</h2>
          </header>
          <div class="rm-stage">
            <div class="rm-col rm-col--left">
              @for (note of leftNotes; track note.id; let i = $index) {
                <app-condition-note
                  class="rm-note"
                  [class.is-shown]="isPinnedShown(note.id)"
                  [attr.inert]="isPinnedShown(note.id) ? null : ''"
                  [note]="note"
                  [tilt]="i"
                  [compact]="true"
                  [open]="openId() === note.id"
                  (toggled)="toggleNote(note.id)"
                />
              }
            </div>
            <ng-container [ngTemplateOutlet]="mapTpl" />
            <div class="rm-col rm-col--right">
              @for (note of rightNotes; track note.id; let i = $index) {
                <app-condition-note
                  class="rm-note"
                  [class.is-shown]="isPinnedShown(note.id)"
                  [attr.inert]="isPinnedShown(note.id) ? null : ''"
                  [note]="note"
                  [tilt]="i + 1"
                  [compact]="true"
                  [open]="openId() === note.id"
                  (toggled)="toggleNote(note.id)"
                />
              }
            </div>
          </div>
        </div>
      </div>

      <div class="rm-more">
        <button type="button" class="rm-more-btn" [attr.aria-expanded]="showMore()" aria-controls="rm-more-grid" (click)="toggleMore($event)">
          {{ showMore() ? 'Show fewer conditions' : 'See ' + moreNotes.length + ' more conditions' }}
        </button>
        @if (showMore()) {
          <div class="rm-more-grid" id="rm-more-grid">
            @for (note of moreNotes; track note.id; let i = $index) {
              <app-condition-note
                class="rm-more-note reveal"
                [appScrollReveal]="(i % 3) * 120"
                [revealRepeat]="true"
                [note]="note"
                [tilt]="i"
                [open]="openId() === note.id"
                (toggled)="toggleNote(note.id)"
              />
            }
          </div>
        }
      </div>
    } @else {
      <!-- Mobile: plain normal-flow column, no pin. A fixed-height sticky
           box here has a long history in this component of overflowing or
           fighting the content around it, and a phone has no spare width
           for a heading to sit beside anything anyway. -->
      <div class="root-map-lead">
        <app-eyebrow-label text="Conditions we treat" />
        <h2 id="root-map-heading" class="root-map-heading">Symptoms and conditions we treat at the root</h2>
        <p class="root-map-intro">Many conditions, many names. Scroll to see where they meet.</p>
      </div>
      <ng-container [ngTemplateOutlet]="mapTpl" />
      <app-conditions-board class="root-map-board" />
    }

    <!-- The fact block: everything above resolves to this one root, so the
         closing beat just states it, then offers the way in. -->
    <section class="rm-fact" aria-labelledby="rm-fact-heading">
      <div class="reveal" [appScrollReveal]="0" [revealRepeat]="true"><app-eyebrow-label text="The common thread" /></div>
      <h3 id="rm-fact-heading" class="rm-fact-heading reveal" [appScrollReveal]="120" [revealRepeat]="true">Every path leads to the same root.</h3>
      <p class="rm-fact-root reveal" [appScrollReveal]="360" [revealRepeat]="true"><span class="mark">Minerals</span> &amp; <span class="mark">vitamin deficiencies</span></p>
      <p class="rm-fact-copy reveal" [appScrollReveal]="560" [revealRepeat]="true">
        When the body runs short of what it needs, it can show up differently in everyone. A consultation finds out which ones are yours.
      </p>
      <div class="rm-fact-cta reveal" [appScrollReveal]="720" [revealRepeat]="true">
        <app-cta-pill label="Find my root in a consultation" variant="primary" (pressed)="bookRequested.emit()" />
      </div>
      <p class="root-map-fine reveal" [appScrollReveal]="860" [revealRepeat]="true">
        This map shows common patterns, not a diagnosis. Please speak to our qualified practitioner for your diagnosis.
      </p>
    </section>
  `,
  styles: `
    :host {
      display: block;
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
    /* Terracotta deepened a touch toward oxblood: plain terracotta under
       ivory text is only ~3.7:1, below the 4.5:1 AA minimum. */
    .root-map-node.lit {
      --lit-family: color-mix(in oklab, var(--terracotta) 72%, var(--oxblood));
      background: var(--lit-family);
      border-color: var(--lit-family);
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

    /* Mobile: compact pills and tighter layer gaps so the three layers
       read as one tidy map on a narrow screen. */
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

      .root-map-wrap {
        padding-block: var(--sp-6);
      }
    }

    /* The caption under the map is large-screen only; on mobile the same
       line closes the fact block. */
    .root-map-caption {
      display: none;
    }

    .root-map-heading {
      margin-top: var(--sp-2);
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(1.4rem, 1.1rem + 1.2vw, 1.9rem);
      line-height: 1.2;
      color: var(--ink);
      max-width: 30ch;
    }

    .root-map-lead {
      padding-bottom: var(--sp-2);
    }

    .root-map-intro {
      margin-top: var(--sp-3);
      color: var(--text-quiet-light);
      line-height: var(--lh-body);
      max-width: 36ch;
    }

    .root-map-board {
      padding-block: var(--sp-4) var(--sp-6);
    }

    /* ---------- large screens: the pinned stage ---------- */

    .rm-pin {
      position: relative;
    }

    .rm-viewport {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: clamp(var(--sp-4), 3vh, var(--sp-8));
      padding-block: var(--sp-6);
    }

    .rm-head {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .rm-head .root-map-heading {
      max-width: none;
      font-size: clamp(1.5rem, 1.1rem + 1vw, 2.1rem);
    }

    .rm-stage {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 580px) minmax(0, 1fr);
      gap: var(--sp-6);
      align-items: center;
    }

    .rm-stage .root-map-wrap {
      padding-block: 0;
    }

    .rm-stage .root-map {
      gap: var(--sp-8);
    }

    .rm-stage .root-map-node {
      font-size: 0.94rem;
      min-height: 38px;
      padding: 0 16px;
    }

    .rm-stage .root-map-caption {
      display: block;
      margin-top: var(--sp-3);
      text-align: center;
      font-size: 9px;
      line-height: 1.5;
      letter-spacing: 0.01em;
      color: color-mix(in oklab, var(--text-quiet-light) 70%, transparent);
    }

    /* Laptops and tablets in landscape (900-1199px): the 580px map plus
       two note columns doesn't fit inside the page gutters, so the stage
       breaks out to nearly the full viewport width, the map narrows, and
       the pills tighten — otherwise the side columns squeeze to under
       150px and the notes overflow the pinned viewport. */
    @media (min-width: 900px) and (max-width: 1199px) {
      .rm-viewport {
        margin-inline: calc(var(--gutter-desktop) * -1 + var(--sp-4));
      }

      .rm-stage {
        grid-template-columns: minmax(0, 1fr) minmax(0, 440px) minmax(0, 1fr);
        gap: var(--sp-4);
      }

      .rm-stage .root-map {
        gap: var(--sp-6);
      }

      .rm-stage .root-map-node {
        font-size: 0.84rem;
        min-height: 34px;
        padding: 0 12px;
      }

      .rm-col {
        gap: var(--sp-4);
      }
    }

    .rm-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--sp-6);
    }

    /* Notes arrive and then stay (like the Treat steps on large screens);
       the reverse scroll simply hands them back. A touch of offset between
       neighbours so they sit like they were pinned by hand. */
    .rm-note {
      opacity: 0;
      transform: translateY(24px);
      pointer-events: none;
      transition:
        opacity var(--dur-scene) var(--ease-out-soft),
        transform var(--dur-scene) var(--ease-out-soft);
    }

    .rm-note.is-shown {
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }

    .rm-col--left .rm-note:nth-child(2) {
      margin-right: 12%;
    }

    .rm-col--right .rm-note:nth-child(2) {
      margin-left: 12%;
    }

    .rm-more {
      padding-block: var(--sp-6) var(--sp-4);
      text-align: center;
    }

    .rm-more-btn {
      min-height: var(--tap-min);
      padding: 0 var(--sp-6);
      border-radius: var(--r-pill);
      border: 1px solid color-mix(in oklab, var(--oxblood) 40%, transparent);
      background: transparent;
      color: var(--oxblood-deep);
      font-family: var(--font-body);
      font-size: 0.95rem;
      cursor: pointer;
    }

    .rm-more-btn:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }

    /* The rest of the notes, spread across the page width — the same notes
       as the mobile column, laid out horizontally. */
    .rm-more-grid {
      margin-top: var(--sp-10);
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--sp-8) var(--sp-6);
      text-align: left;
    }

    .rm-more-note:nth-child(3n + 2) {
      margin-top: var(--sp-6);
    }

    /* ---------- the fact block ---------- */

    .rm-fact {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--sp-5);
      padding-block: var(--sp-16) var(--sp-24);
    }

    .rm-fact-heading {
      margin: 0;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(1.8rem, 1.3rem + 2.4vw, 3rem);
      line-height: 1.1;
      color: var(--ink);
      max-width: 20ch;
    }

    /* The single fact the whole section builds to — set as display type
       with the hero's own treatment: same face, weight, size and ink colour,
       the same blue highlighter underline on the key words, and none under
       the ampersand. */
    .rm-fact-root {
      margin: 0;
      font-family: var(--font-display);
      font-weight: 300;
      /* Same size as the hero's highlighted sub-line (headline size less 3px). */
      font-size: calc(clamp(2.3rem, 1.6rem + 3vw, 3.5rem) - 3px);
      line-height: 1.1;
      letter-spacing: var(--ls-display);
      color: var(--ink);
      max-width: 22ch;
    }

    .rm-fact-root .mark {
      background: linear-gradient(transparent 62%, color-mix(in oklab, var(--evidence-blue) 55%, transparent) 62%);
      padding: 0 2px;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
    }

    .rm-fact-copy {
      margin: 0;
      max-width: 46ch;
      line-height: var(--lh-body);
      color: var(--text-quiet-light);
    }

    .rm-fact-cta {
      margin-top: var(--sp-3);
    }

    .root-map-fine {
      margin: var(--sp-6) 0 0;
      font-size: 0.82rem;
      color: var(--text-quiet-light);
      max-width: 46ch;
    }

    @media (prefers-reduced-motion: reduce) {
      .root-map-links path,
      .root-map-layer,
      .root-map-node,
      .rm-note {
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

  protected readonly leftNotes = LEFT_NOTES;
  protected readonly rightNotes = RIGHT_NOTES;
  protected readonly moreNotes = MORE_NOTES;
  protected readonly deskPinVh = DESKTOP_PIN_VH;

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

  // Large screens reveal the map's layers as the pinned stage engages and
  // bring the notes in as it scrolls (deskStage / deskNoteCount). Mobile
  // has no pin, so the layers follow the map's own position as it scrolls
  // through the viewport instead.
  protected readonly isDesktop = signal(typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT);
  private readonly mobileConditionsVisible = signal(false);
  private readonly mobileRootsVisible = signal(false);
  private readonly deskStage = signal(0);
  private readonly deskNoteCount = signal(0);

  protected readonly openId = signal<string | null>(null);
  protected readonly showMore = signal(false);

  /** What's lit on the map: whatever the reader tapped, else (large screens) the family of the note that just arrived — so each note shows its own trace. */
  protected readonly focusSet = computed<ReadonlySet<string>>(() => {
    if (this.selected().size > 0) {
      return this.selected();
    }
    const count = this.deskNoteCount();
    return this.isDesktop() && count > 0 ? new Set([PINNED_NOTES[count - 1].familyId]) : new Set<string>();
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

  protected readonly showConditions = computed(
    () => this.selected().size > 0 || (this.isDesktop() ? this.deskStage() >= 1 : this.mobileConditionsVisible()),
  );
  protected readonly showRoots = computed(
    () => this.selected().size > 0 || (this.isDesktop() ? this.deskStage() >= 2 : this.mobileRootsVisible()),
  );

  private readonly mapBox = viewChild<ElementRef<HTMLElement>>('mapBox');
  private readonly linksSvg = viewChild<ElementRef<SVGSVGElement>>('linksSvg');
  private readonly deskPin = viewChild<ElementRef<HTMLElement>>('deskPin');

  protected readonly pathData = signal<readonly string[]>([]);

  private layoutRaf = 0;
  private scrollRaf = 0;
  private resizeObserver: ResizeObserver | undefined;

  protected isLit(id: string): boolean {
    return this.focusSet().has(id) || this.reachedConditionIds().has(id) || this.reachedRootIds().has(id);
  }

  protected isLinkVisible(link: MapLink): boolean {
    return link.kind === 'sr' ? this.showConditions() : this.showRoots();
  }

  protected isLinkLit(link: MapLink): boolean {
    return this.isLit(link.from) && this.isLit(link.to);
  }

  protected isPinnedShown(noteId: string): boolean {
    return PINNED_ORDER[noteId] < this.deskNoteCount();
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

  protected toggleNote(id: string): void {
    this.openId.update((current) => (current === id ? null : id));
  }

  protected toggleMore(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const wasOpen = this.showMore();
    this.showMore.set(!wasOpen);
    if (wasOpen) {
      // Collapsing shortens the page under the reader — keep the button, and the reader, in place.
      this.openId.set(null);
      requestAnimationFrame(() => button.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    }
  }

  ngAfterViewInit(): void {
    const onScroll = () => {
      if (this.scrollRaf) {
        return;
      }
      this.scrollRaf = requestAnimationFrame(() => {
        this.scrollRaf = 0;
        this.update();
      });
    };
    const onResize = () => {
      this.update();
      this.queueLayout();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    this.observeMap();
    this.update();
    this.queueLayout();

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(this.scrollRaf);
      cancelAnimationFrame(this.layoutRaf);
      this.resizeObserver?.disconnect();
    });
  }

  /** The map element is re-created whenever the layout flips between mobile and desktop, so the resize observer has to follow it. */
  private observeMap(): void {
    this.resizeObserver?.disconnect();
    const mapEl = this.mapBox()?.nativeElement;
    if (mapEl && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.queueLayout());
      this.resizeObserver.observe(mapEl);
    }
  }

  private update(): void {
    const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    if (desktop !== this.isDesktop()) {
      this.isDesktop.set(desktop);
      // The other layout renders on the next frame; re-attach once it has.
      requestAnimationFrame(() => {
        this.observeMap();
        this.update();
        this.queueLayout();
      });
      return;
    }
    if (desktop) {
      this.updateDesktop();
    } else {
      this.updateMobileMapReveal();
    }
  }

  /**
   * Large screens: everything keys off the pinned stage's own position.
   * The map's layers draw in as the stage approaches and engages, then the
   * notes arrive one by one across the pinned scroll — a plain function of
   * scroll position, so scrolling back up simply reverses it.
   */
  private updateDesktop(): void {
    const pinEl = this.deskPin()?.nativeElement;
    if (!pinEl) {
      return;
    }
    const vh = window.innerHeight;
    const rect = pinEl.getBoundingClientRect();
    const stage = rect.top < vh * 0.2 ? 2 : rect.top < vh * 0.55 ? 1 : 0;
    const scrollable = rect.height - vh;
    const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
    const count = this.reducedMotion()
      ? PINNED_NOTE_COUNT
      : progress < NOTES_START
        ? 0
        : Math.min(PINNED_NOTE_COUNT, Math.floor((progress - NOTES_START) / NOTES_STEP) + 1);

    if (stage !== this.deskStage()) {
      this.deskStage.set(stage);
      this.queueLayout();
    }
    if (count !== this.deskNoteCount()) {
      this.deskNoteCount.set(count);
    }
  }

  /**
   * On mobile, the map has no pin to sync its reveal against — it's a plain
   * block, so the reveal is driven by how far the map itself has scrolled
   * through the viewport: conditions unlock once its top third has passed
   * the activation line, roots once two-thirds have. Only a flip (not every
   * scroll pixel) re-queues the link layout.
   */
  private updateMobileMapReveal(): void {
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
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
