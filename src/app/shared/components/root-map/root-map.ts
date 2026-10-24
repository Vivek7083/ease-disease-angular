import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { ConditionNoteCard } from '../conditions-board/condition-note';
import { ConditionsBoard } from '../conditions-board/conditions-board';
import { NOTES } from '../conditions-board/conditions-data';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';
import { DESKTOP_TREE, MOBILE_TREE, buildTree } from './root-map-tree';

interface MapNode {
  readonly id: string;
  readonly label: string;
}

// Draft data - an illustrative pattern map, not a clinical claim. Top layer
// is the seven families the PRD's condition list folds into (the full list
// lives on the notes in app-conditions-board); the bottom layer is a single
// root - minerals & vitamin deficiencies - per the PRD. The middle layer
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

// Six root causes, shown below the ground line; each condition traces to the roots behind it.
const ROOTS: readonly MapNode[] = [
  { id: 'deficiency', label: 'Nutritional deficiencies' },
  { id: 'stress', label: 'Stress & trauma' },
  { id: 'sleep', label: 'Lack of sleep' },
  { id: 'toxins', label: 'Toxins & medications' },
  { id: 'infections', label: 'Infections' },
  { id: 'genetics', label: 'Genetics' },
];

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
  digestion: ['deficiency', 'infections', 'toxins'],
  inflammation: ['toxins', 'infections', 'stress', 'genetics'],
  bloodsugar: ['deficiency', 'sleep', 'stress', 'genetics'],
  hormonal: ['stress', 'sleep', 'toxins', 'deficiency'],
  nervous: ['stress', 'sleep', 'deficiency'],
};

const DESKTOP_BREAKPOINT = 900;

/** Large screens: the notes pinned around the map, in PRD order - three each side - and everything after them behind "see more". */
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
 * mechanisms behind them to one root - minerals and vitamin deficiencies.
 * Large screens: the map sits pinned in the centre while the PRD's condition
 * notes pin themselves around it, one by one, as you scroll. Mobile: the
 * map, then a column of the same notes. Both end on the same "fact" block
 * that names the common root and leads to booking.
 */
@Component({
  selector: 'app-root-map',
  imports: [NgTemplateOutlet, ScrollRevealDirective, ConditionNoteCard, ConditionsBoard, EyebrowLabel],
  template: `
    <!-- The map itself, declared once and placed by whichever layout is
         showing - pinned in the centre stage on large screens, in plain
         flow on mobile. -->
    <ng-template #mapTpl>
      <div class="root-map-wrap">
        <div class="root-map" [class.focus]="active() !== null">
          <p class="root-map-layer-label root-map-tap">Tap any condition to trace it down to its root ↓</p>
          <div
            class="tree"
            [style.aspect-ratio]="geo().w + ' / ' + geo().h"
            [style.--tw]="geo().w"
            [style.--th]="geo().h"
            [style.--fs]="geo().fs + 'cqw'"
            [style.--ch]="geo().ch + 'cqw'"
            [style.--pad]="geo().pad + 'cqw'"
            (pointerdown)="dismissHint()"
          >
            <svg class="tree-art" [attr.viewBox]="'0 0 ' + geo().w + ' ' + geo().h" aria-hidden="true">
              <g class="grey">
                <path class="canopy-fill" [attr.d]="art().canopyFill" />
                <path class="canopy" [attr.d]="art().canopy" />
                <path class="tick" [attr.d]="art().ticks" />
                @for (b of art().branches; track b.key) {
                  <path class="branch" [attr.d]="b.d" />
                }
                <path class="trunk" [attr.d]="art().trunkLeft" />
                <path class="trunk" [attr.d]="art().trunkRight" />
                <path class="trunk" [attr.d]="art().arms" />
                @for (d of art().bark; track $index) {
                  <path class="bark" [attr.d]="d" />
                }
                <path class="ground" [attr.d]="art().ground" />
                @for (r of art().roots; track r.key) {
                  <path class="root" [class.root-off]="!isRootShown(r.key)" [class.root-tease]="isTease(r.key)" [attr.d]="r.d" />
                }
              </g>
              <g class="blue-lines">
                @for (t of art().twigs; track t.key) {
                  <path class="blue" pathLength="1" style="--d: 0ms" [attr.d]="t.d" [class.on]="active() === t.fruit" />
                }
                @for (b of art().blueBranches; track b.key) {
                  <path class="blue" pathLength="1" style="--d: 250ms" [attr.d]="b.d" [class.on]="activeSymptoms().includes(b.key)" />
                }
                <path class="blue" pathLength="1" style="--d: 500ms" [attr.d]="art().trunk" [class.on]="active() !== null" />
                @for (r of art().roots; track r.key) {
                  <path class="blue" pathLength="1" style="--d: 750ms" [attr.d]="r.d" [class.on]="activeRoots().includes(r.key)" />
                }
              </g>
            </svg>

            @for (node of symptoms; track node.id; let i = $index) {
              <button
                type="button"
                class="root-map-node tree-chip"
                [style.left.%]="at(geo().fruits[node.id]).left"
                [style.top.%]="at(geo().fruits[node.id]).top"
                [attr.data-id]="node.id"
                [class.lit]="isLit(node.id)"
                [class.selected]="active() === node.id"
                [class.nudge]="!rootsRevealed() && !reducedMotion()"
                [style.--nudge-delay]="i * 140 + 'ms'"
                [attr.aria-pressed]="active() === node.id"
                (click)="toggleSymptom(node.id)"
              >
                {{ node.label }}
                <!-- A one-time simulated tap on the first pill - the only
                     hint that these are tappable at all. Dismisses itself
                     once its animation finishes, or the instant the reader
                     actually touches/clicks anything in the tree. -->
                @if (i === 0 && showClickHint() && !reducedMotion()) {
                  <span class="click-hint" aria-hidden="true">
                    <span class="click-hint-ripple"></span>
                    <span class="click-hint-dot" (animationend)="dismissHint()"></span>
                  </span>
                }
              </button>
            }

            <span class="tree-label" [style.left.%]="at(geo().howLabel).left" [style.top.%]="at(geo().howLabel).top">How it shows up</span>
            @for (node of conditions; track node.id) {
              <span
                class="root-map-node root-map-node--static tree-chip"
                style="--d: 250ms"
                [style.left.%]="at(geo().symptoms[node.id]).left"
                [style.top.%]="at(geo().symptoms[node.id]).top"
                [attr.data-id]="node.id"
                [class.lit]="isLit(node.id)"
                >{{ node.label }}</span
              >
            }

            <span class="tree-label tree-label--why" [class.root-off]="!anyRootShown()" [style.left.%]="at(geo().whyLabel).left" [style.top.%]="at(geo().whyLabel).top">Why it happens</span>
            @for (node of roots; track node.id) {
              <span
                class="root-map-node root-map-node--root tree-chip"
                style="--d: 1000ms"
                [class.root-off]="!isRootShown(node.id)"
                [class.root-tease]="isTease(node.id)"
                [attr.aria-hidden]="isRootShown(node.id) ? null : 'true'"
                [style.left.%]="at(geo().roots[node.id]).left"
                [style.top.%]="at(geo().roots[node.id]).top"
                [attr.data-id]="node.id"
                [class.lit]="isLit(node.id)"
                >{{ node.label }}</span
              >
            }
          </div>

          @if (isDesktop()) {
            <div class="rm-more-bar">
              <button type="button" class="rm-more-btn" [attr.aria-expanded]="showMore()" aria-controls="rm-more-grid" (click)="toggleMore($event)">
                {{ showMore() ? 'Show fewer conditions' : 'See ' + moreNotes.length + ' more conditions' }}
              </button>
            </div>
          }
          <p class="root-map-caption">* This map shows common patterns, not a diagnosis. Please speak to our qualified practitioner for your diagnosis.</p>
        </div>
      </div>
    </ng-template>

    @if (isDesktop()) {
      <!-- Large screens: ONE pinned viewport holds the heading, the map and
           the notes. Which notes are showing is just their opacity/rise
           following scroll progress - nothing is added or removed, so
           scrolling back up un-pins them in reverse. -->
      <header class="rm-head">
        <app-eyebrow-label text="The bigger picture" />
        <h2 id="root-map-heading" class="root-map-heading">What Your Body May Be Telling You</h2>
        <p class="rm-sub">You may have questions about recurring symptoms, changes in your well-being, or why you still don't feel your best. It can be frustrating when you don't know what to do next.</p>
      </header>
      <div class="rm-pin" #deskPin [style.height.vh]="deskPinVh">
        <div class="rm-viewport">
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
        <app-eyebrow-label text="The bigger picture" />
        <h2 id="root-map-heading" class="root-map-heading">What Your Body May Be Telling You</h2>
        <p class="root-map-intro">You may have questions about recurring symptoms, changes in your well-being, or why you still don't feel your best. It can be frustrating when you don't know what to do next.</p>
      </div>
      <ng-container [ngTemplateOutlet]="mapTpl" />
      <app-conditions-board class="root-map-board" />
    }

  `,
  styles: `
    :host {
      display: block;
    }

    /* Mobile: no sticky, no fixed height, no background - just a plain
       block sitting after the narration and before the closing card, sized
       to whatever its (fully-revealed) content actually needs. A fixed-height
       sticky box here kept overflowing into the narration no matter how far
       it was stretched or how compact the pills got - three full layers of
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

    .root-map.focus .root-map-node:not(.lit):not(.selected) {
      opacity: 0.45;
    }

    .root-map-layer-label {
      margin-bottom: 14px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--text-quiet-light);
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
      color: #000;
      font-family: var(--font-body);
      font-size: 0.92rem;
      cursor: default;
      transition:
        background var(--dur-base) var(--ease),
        border-color var(--dur-base) var(--ease),
        color var(--dur-base) var(--ease),
        opacity var(--dur-base) var(--ease);
    }

    /* One-time simulated tap on the first pill - approaches, presses down
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

    /* Until the reader taps a top-level condition the deeper layer stays
       hidden, so the condition pills breathe with a soft ring to say "tap me",
       staggered left to right. */
    button.root-map-node.nudge:not(.selected) {
      animation: root-map-nudge 2.6s ease-in-out infinite;
      animation-delay: var(--nudge-delay, 0ms);
    }
    @keyframes root-map-nudge {
      0%,
      60%,
      100% {
        box-shadow: 0 0 0 0 transparent;
      }
      30% {
        box-shadow: 0 0 0 5px color-mix(in oklab, var(--oxblood) 18%, transparent);
      }
    }

    button.root-map-node:hover {
      border-color: var(--oxblood);
    }

    /* Conditions layer - the middle "what's really going on" row - carries
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

    /* Default (symptoms layer, the buttons) lights up terracotta - the
       warmest, most immediate tone, for the layer the reader interacts
       with directly. */
    /* Terracotta deepened a touch toward oxblood: plain terracotta under
       ivory text is only ~3.7:1, below the 4.5:1 AA minimum. */
    /* Lit chips, top to bottom: the symptoms (the leaves) olive, the conditions
       between a blend of burgundy and olive, the roots burgundy. The traced
       path is burgundy. */
    .root-map-node.lit,
    .root-map-node.selected {
      background: var(--olive);
      border-color: var(--olive);
      color: var(--ivory);
    }

    .root-map-node--static.lit {
      --mid-blend: color-mix(in oklab, var(--oxblood) 55%, var(--olive));
      background: var(--mid-blend);
      border-color: var(--mid-blend);
    }

    .root-map-node--root.lit {
      background: var(--oxblood);
      border-color: var(--oxblood);
    }

    /* Mobile: compact pills so the whole tree fits a narrow screen. */
    @media (max-width: 899px) {
      .root-map-node {
        font-size: 0.75rem;
        padding: 0 9px;
        min-height: 28px;
      }

      button.root-map-node {
        min-height: 32px;
      }

      .root-map-node--root {
        font-size: 0.82rem;
        min-height: 32px;
        padding: 0 10px;
      }

      .root-map-layer-label {
        font-size: 0.72rem;
        margin-bottom: 10px;
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
      grid-template-columns: minmax(0, 1fr) minmax(0, 740px) minmax(0, 1fr);
      gap: 32px;
      align-items: center;
    }

    .rm-stage .root-map-wrap {
      padding-block: 0;
    }

    .rm-stage .root-map-caption {
      display: block;
      margin-top: 14px;
      text-align: center;
      font-size: 9px;
      line-height: 1.5;
      letter-spacing: 0.01em;
      color: color-mix(in oklab, var(--text-quiet-light) 70%, transparent);
    }

    /* Laptops and tablets in landscape (900-1199px): the 580px map plus
       two note columns doesn't fit inside the page gutters, so the stage
       breaks out to nearly the full viewport width, the map narrows, and
       the pills tighten - otherwise the side columns squeeze to under
       150px and the notes overflow the pinned viewport. */
    @media (min-width: 900px) and (max-width: 1199px) {
      .rm-viewport {
        margin-inline: calc(var(--gutter-desktop) * -1 + var(--sp-4));
      }

      .rm-stage {
        grid-template-columns: minmax(0, 1fr) minmax(0, 440px) minmax(0, 1fr);
        gap: var(--sp-4);
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
      color: #000;
      font-family: var(--font-body);
      font-size: 0.95rem;
      cursor: pointer;
    }

    .rm-more-btn:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }

    /* The rest of the notes, spread across the page width - the same notes
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

    @media (prefers-reduced-motion: reduce) {
      button.root-map-node.nudge {
        animation: none;
      }
      .root-map-node,
      .rm-note,
      .blue,
      .grey .root {
        transition: none !important;
      }
    }

    /* ---- Text and spacing around the tree (Step 25) ---- */
    /* Desktop subtext under "What Your Body May Be Telling You" */
    .rm-sub {
      max-width: 60ch;
      margin: 10px auto 0;
      text-align: center;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #000;
    }

    /* Desktop: heading block sits above the pinned tree, with comfortable spacing */
    @media (min-width: 900px) {
      .rm-head {
        padding: 72px 0 0;
      }
      .rm-head .root-map-heading {
        margin-top: 14px !important;
      }
      .rm-sub {
        font-size: 17px !important;
        line-height: 1.65;
        max-width: 62ch;
        margin-top: 18px !important;
      }
      /* Start the tree right below the intro text instead of centring it in the screen-high frame */
      .rm-viewport {
        justify-content: flex-start !important;
        padding-block: 28px 14px !important;
      }
    }

    /* ---- The tree: ONE box, lines and chips in the same coordinate system ---- */
    .root-map {
      display: block;
    }
    .root-map-tap {
      margin: 0 0 10px;
      color: #000;
    }
    .tree {
      position: relative;
      width: 100%;
      margin-inline: auto;
      container-type: inline-size;
    }
    /* Desktop: scale the whole tree so it fits the screen-high pinned frame (tap label to lowest root). */
    @media (min-width: 900px) {
      .tree {
        width: min(100%, calc((100vh - 190px) * var(--tw) / var(--th)));
      }
    }
    .tree-art {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }
    .tree-art path {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    /* Thin grey lines only; a little hierarchy through width alone. */
    /* The canopy's closed outline is only the area the fruit chips sit inside; the visible edge is a row of curls. */
    .grey .canopy-fill {
      stroke: none;
    }
    .grey .canopy {
      stroke: #c8c8c8;
      stroke-width: 1.3;
    }
    .grey .tick {
      stroke: #d0d0d0;
      stroke-width: 1.1;
    }
    .grey .bark {
      stroke: #cbcbcb;
      stroke-width: 1.3;
    }
    .grey .trunk {
      stroke: #bdbdbd;
      stroke-width: 2;
    }
    .grey .branch {
      stroke: #c8c8c8;
      stroke-width: 1.3;
    }
    .grey .ground,
    .grey .root {
      stroke: #c8c8c8;
      stroke-width: 1.2;
    }
    /* The traced path: hidden until a condition is clicked, then drawn stage by stage (--d is each stage's start delay). */
    .blue {
      stroke: var(--oxblood);
      stroke-width: 2.5;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      opacity: 0;
      transition:
        opacity 0.3s ease,
        stroke-dashoffset 0s linear 0.3s;
    }
    .blue.on {
      stroke-dashoffset: 0;
      opacity: 1;
      transition:
        stroke-dashoffset 250ms linear var(--d, 0ms),
        opacity 0s;
    }

    /* Chips are sized in container units, so they scale with the lines: no clamp(), no breakpoint sizes. */
    .tree-chip,
    button.root-map-node.tree-chip {
      position: absolute;
      z-index: 2;
      transform: translate(-50%, -50%);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      height: var(--ch);
      min-height: 0;
      padding: 0 var(--pad);
      font-size: var(--fs);
      line-height: 1;
    }
    /* A lit chip fills in when the blue line reaches it (--d); fading in or out is never delayed. */
    .tree-chip.lit {
      transition:
        background var(--dur-base) var(--ease) var(--d, 0ms),
        border-color var(--dur-base) var(--ease) var(--d, 0ms),
        color var(--dur-base) var(--ease) var(--d, 0ms),
        opacity 0.18s var(--ease) 0ms;
    }

    /* Roots stay out of sight until a condition is tapped (traced roots then appear as the blue line reaches them),
       except one teased root, faint, now and then; once the story is done they all stay. */
    .root-map-node--root,
    .tree-label--why {
      transition:
        opacity 0.18s var(--ease),
        background var(--dur-base) var(--ease),
        border-color var(--dur-base) var(--ease),
        color var(--dur-base) var(--ease);
    }
    .root-map-node--root.root-off,
    .tree-label--why.root-off {
      opacity: 0 !important;
      pointer-events: none;
    }
    .root-map-node--root.root-tease {
      opacity: 0.65 !important;
    }
    .grey .root {
      transition: opacity 0.18s var(--ease);
    }
    .grey .root.root-off {
      opacity: 0;
    }
    .grey .root.root-tease {
      opacity: 0.75;
    }
    /* Mobile: let the tree use a little of the page gutter so the longest chips fit each side of the trunk. */
    @media (max-width: 899px) {
      .tree {
        width: calc(100% + 24px);
        margin-inline: -12px;
      }
    }

    /* The link and the footnote stack under the tree, centred, with clear space between them. */
    .rm-more-bar {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
    .rm-more-bar .rm-more-btn {
      min-height: 36px;
      padding: 0 var(--sp-5);
      font-size: 0.88rem;
    }
    .root-map-node--root {
      background: #fff;
    }

    .tree-label {
      position: absolute;
      z-index: 2;
      transform: translate(-50%, -50%);
      padding: 2px 10px;
      border-radius: 999px;
      background: var(--ivory);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: #000;
      white-space: nowrap;
    }

    /* Nothing is highlighted until a condition is clicked (no auto-lighting while the side notes scroll past). */
    .root-map:not(.focus) .root-map-node.lit,
    .root-map:not(.focus) .root-map-node--root.lit {
      background: color-mix(in oklab, var(--oxblood) 6%, var(--ivory));
      border-color: color-mix(in oklab, var(--oxblood) 30%, transparent);
      color: #000;
    }
    .root-map:not(.focus) .root-map-node--root.lit {
      background: #fff;
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

    // Fallback in case `animationend` never fires - the hint is a one-time
    // nudge, not something that should linger indefinitely either way.
    const dismissTimer = window.setTimeout(() => this.dismissHint(), 2600);
    this.destroyRef.onDestroy(() => window.clearTimeout(dismissTimer));
  }

  readonly bookRequested = output<void>();

  /** Only one condition is traced at a time: clicking another switches to it, clicking the same one clears it. */
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly active = computed<string | null>(() => [...this.selected()][0] ?? null);

  /** The middle chips (symptoms) and roots the clicked condition leads to. */
  protected readonly activeSymptoms = computed<readonly string[]>(() => SYMPTOM_TO_CONDITION[this.active() ?? ''] ?? []);
  protected readonly activeRoots = computed<readonly string[]>(() => {
    const roots = new Set<string>();
    for (const s of this.activeSymptoms()) {
      for (const r of CONDITION_TO_ROOT[s] ?? []) {
        roots.add(r);
      }
    }
    return [...roots];
  });

  // Large screens: the notes arrive as the pinned stage scrolls (deskNoteCount).
  protected readonly isDesktop = signal(typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT);
  private readonly deskNoteCount = signal(0);

  protected readonly openId = signal<string | null>(null);
  protected readonly showMore = signal(false);

  /** Latched once the reader has been through the whole story: every root then stays on show. */
  private readonly allRoots = signal(false);
  /** The one root teased (faintly, with its line from the trunk) before any tap. Picked at random, and changes now and then. */
  private readonly teaseRoot = signal<string | null>(null);

  /**
   * Before any tap only the teased root shows. The first tap on any condition reveals ALL the roots (they then
   * stay), and only the roots that condition leads to are filled in blue. Finishing the story shows them all too.
   */
  protected isRootShown(id: string): boolean {
    return this.allRoots() || this.rootsRevealed() || this.teaseRoot() === id;
  }

  protected isTease(id: string): boolean {
    return !this.allRoots() && !this.rootsRevealed() && this.teaseRoot() === id;
  }

  protected readonly anyRootShown = computed(() => this.allRoots() || this.rootsRevealed() || this.teaseRoot() !== null);

  /** Set on the first tap; until then the top chips breathe with a soft ring. */
  protected readonly rootsRevealed = signal(false);

  private readonly deskPin = viewChild<ElementRef<HTMLElement>>('deskPin');

  /** The tree's geometry for the current breakpoint, and every line drawn from it. */
  protected readonly geo = computed(() => (this.isDesktop() ? DESKTOP_TREE : MOBILE_TREE));
  protected readonly art = computed(() =>
    buildTree(this.geo(), { fruitToSymptom: SYMPTOM_TO_CONDITION }),
  );

  private scrollRaf = 0;

  /** A tree point as percentages of the tree box, for placing a chip. */
  protected at(p: { readonly x: number; readonly y: number } | undefined): { left: number; top: number } {
    const g = this.geo();
    return p ? { left: (p.x / g.w) * 100, top: (p.y / g.h) * 100 } : { left: 0, top: 0 };
  }

  protected isLit(id: string): boolean {
    const active = this.active();
    return active === id || this.activeSymptoms().includes(id) || this.activeRoots().includes(id);
  }

  protected isPinnedShown(noteId: string): boolean {
    return PINNED_ORDER[noteId] < this.deskNoteCount();
  }

  protected toggleSymptom(id: string): void {
    this.dismissHint();
    if (this.active() === id) {
      this.selected.set(new Set());
      return;
    }
    this.selected.set(new Set([id]));
    this.rootsRevealed.set(true);
  }

  protected toggleNote(id: string): void {
    this.openId.update((current) => (current === id ? null : id));
  }

  protected toggleMore(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const wasOpen = this.showMore();
    this.showMore.set(!wasOpen);
    if (wasOpen) {
      // Collapsing shortens the page under the reader - keep the button, and the reader, in place.
      this.openId.set(null);
      requestAnimationFrame(() => button.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    } else {
      // The link sits in the pinned frame, so take the reader to the notes it just revealed.
      requestAnimationFrame(() => document.getElementById('rm-more-grid')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
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
    const onResize = () => this.update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    this.update();

    const pickTease = () => {
      const ids = this.roots.map((r) => r.id).filter((id) => id !== this.teaseRoot());
      this.teaseRoot.set(ids[Math.floor(Math.random() * ids.length)]);
    };
    pickTease();
    const teaseTimer = window.setInterval(() => {
      if (!this.reducedMotion() && !this.rootsRevealed() && !this.allRoots()) {
        pickTease();
      }
    }, 2800);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(this.scrollRaf);
      window.clearInterval(teaseTimer);
      document.documentElement.classList.remove('rm-tree-on-screen');
    });
  }

  /** On small screens the site's fixed scroll rail (right edge) would sit on top of the tree, so hide it while the tree is on screen. */
  private syncRail(): void {
    const tree = document.querySelector('app-root-map .tree');
    const rect = tree?.getBoundingClientRect();
    const overlaps = !!rect && window.innerWidth < DESKTOP_BREAKPOINT && rect.bottom > 0 && rect.top < window.innerHeight;
    document.documentElement.classList.toggle('rm-tree-on-screen', overlaps);
  }

  private update(): void {
    this.syncRail();
    const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    if (desktop !== this.isDesktop()) {
      this.isDesktop.set(desktop);
      return;
    }
    if (desktop) {
      this.updateDesktop();
    } else {
      const rect = document.querySelector('app-root-map .tree')?.getBoundingClientRect();
      if (rect && rect.bottom < window.innerHeight * 0.25) {
        this.allRoots.set(true);
      }
    }
  }

  /**
   * Large screens: the notes arrive one by one across the pinned scroll - a
   * plain function of scroll position, so scrolling back up simply reverses it.
   */
  private updateDesktop(): void {
    const pinEl = this.deskPin()?.nativeElement;
    if (!pinEl) {
      return;
    }
    const vh = window.innerHeight;
    const rect = pinEl.getBoundingClientRect();
    const scrollable = rect.height - vh;
    const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
    const count = this.reducedMotion()
      ? PINNED_NOTE_COUNT
      : progress < NOTES_START
        ? 0
        : Math.min(PINNED_NOTE_COUNT, Math.floor((progress - NOTES_START) / NOTES_STEP) + 1);

    if (count !== this.deskNoteCount()) {
      this.deskNoteCount.set(count);
    }
    if (count >= PINNED_NOTE_COUNT) {
      this.allRoots.set(true);
    }
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
