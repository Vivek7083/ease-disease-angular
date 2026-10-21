import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';

/** Conventional medicine's side of the comparison, in the order it is shown. */
const CONVENTIONAL: readonly string[] = [
  'Diseased centered',
  'Treated by symptoms',
  'Pharmacological approach',
  'Health is about absence of the disease',
  'Operates the organs independently',
  'Generalized approach',
  'Gene expression cannot be altered',
  'Pathology focus - symptoms management',
  'Doctor centered',
  'Diagnosis is based on symptoms',
  'Reaction approach',
];

/** Functional medicine's side. */
const FUNCTIONAL: readonly string[] = [
  'Asks the question WHY the condition exists?',
  'WHAT triggered the condition?',
  'WHAT is the reason for key imbalances?',
  'WHAT mediates and causes the condition to continue?',
  'WHAT can you use apart from allopathy for treatment?',
  'Prevention focused',
  'Lifestyle and Nutritional based approach',
  'Looking for the cause',
  'Patient centered - personalized approach',
  'Gene expression can be altered',
  'Health is about vitality',
  'Holistic Approach',
];

/**
 * Conventional vs functional medicine.
 *
 * Large screens: two panels facing each other, the conventional side quiet
 * and flat (a white card, hollow markers) and the functional side deep navy
 * and lifted (blue ticks), with a "vs" badge where they meet.
 *
 * Small screens: the same lists read point by point instead. Each point is one
 * row, in the order the two lists are given: the conventional line, a small
 * arrow, then the functional line it is set against. Rows come in one at a
 * time as they scroll into view: the conventional line, the arrow drawing
 * itself, then the functional line.
 */
@Component({
  selector: 'app-approach-compare',
  imports: [ScrollRevealDirective],
  template: `
    <div class="compare" [appScrollReveal]="0">
      <section class="panel panel--conventional" aria-labelledby="compare-conventional">
        <h3 id="compare-conventional" class="panel-title">Conventional Medicine</h3>
        <ul class="items">
          @for (item of conventional; track item; let i = $index) {
            <li class="item" [style.--i]="i">
              <span class="mark" aria-hidden="true"></span>
              <span class="label">{{ item }}</span>
            </li>
          }
        </ul>
      </section>

      <div class="versus" aria-hidden="true"><span>Vs.</span></div>

      <section class="panel panel--functional" aria-labelledby="compare-functional">
        <h3 id="compare-functional" class="panel-title">Functional Medicine</h3>
        <ul class="items">
          @for (item of functional; track item; let i = $index) {
            <li class="item" [style.--i]="i">
              <span class="mark" aria-hidden="true">
                <svg viewBox="0 0 20 20"><path d="M5.5 10.5l3 3 6-7" /></svg>
              </span>
              <span class="label">{{ item }}</span>
            </li>
          }
        </ul>
      </section>
    </div>

    <div class="points">
      <ol class="rows">
        @for (item of conventional; track item; let i = $index) {
          <li class="pair" [appScrollReveal]="0">
            <span class="num" aria-hidden="true">{{ i + 1 }}</span>
            <div class="pair-body">
              <div class="conv">
                <span class="tag tag--conv">Conventional</span>
                <p class="conv-text">{{ item }}</p>
              </div>
              <svg class="arrow" viewBox="0 0 20 28" aria-hidden="true">
                <path d="M10 2v20M4 17l6 7 6-7" />
              </svg>
              <div class="func">
                <span class="mark mark--tick" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5.5 10.5l3 3 6-7" /></svg></span>
                <div class="func-copy">
                  <span class="tag tag--func">Functional</span>
                  <p class="func-text">{{ functional[i] }}</p>
                </div>
              </div>
            </div>
          </li>
        }
        @for (item of extra; track item) {
          <li class="pair pair--last" [appScrollReveal]="0">
            <span class="num num--tick" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5.5 10.5l3 3 6-7" /></svg></span>
            <div class="pair-body">
              <div class="func func--last">
                <span class="mark mark--tick" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5.5 10.5l3 3 6-7" /></svg></span>
                <div class="func-copy">
                  <span class="tag tag--func">Functional</span>
                  <p class="func-text">{{ item }}</p>
                </div>
              </div>
            </div>
          </li>
        }
      </ol>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .mark {
      flex: none;
      width: 22px;
      height: 22px;
      margin-top: 1px;
      border-radius: 50%;
      display: grid;
      place-items: center;
    }
    .mark svg {
      width: 14px;
      height: 14px;
    }
    .mark--plain {
      border: 1.5px solid #c8c8c8;
    }
    .mark--tick {
      background: var(--highlight-blue);
    }
    .mark--tick path {
      fill: none;
      stroke: var(--oxblood);
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    /* ---------- large screens: two panels ---------- */

    .compare {
      position: relative;
      display: none;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-6);
      align-items: stretch;
    }

    .panel {
      position: relative;
      padding: var(--sp-8);
      border-radius: var(--r-lg, 22px);
    }

    .panel-title {
      margin: 0 0 var(--sp-5);
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(1.4rem, 1.1rem + 1vw, 1.8rem);
      line-height: 1.15;
      letter-spacing: -0.01em;
    }

    .items {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--sp-4);
    }

    .item {
      display: flex;
      align-items: flex-start;
      gap: var(--sp-3);
      font-family: var(--font-body);
      font-size: 1rem;
      line-height: 1.4;
    }

    /* Conventional: flat and quiet. A white card, hollow grey markers. */
    .panel--conventional {
      background: var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      color: #000;
      padding-right: calc(var(--sp-8) + 24px);
    }
    .panel--conventional .panel-title {
      color: #000;
    }
    .panel--conventional .item .mark {
      border: 1.5px solid #c8c8c8;
    }

    /* Functional: deep navy and lifted, with blue ticks. */
    .panel--functional {
      background: var(--oxblood);
      color: #fff;
      box-shadow: var(--shadow-lift);
      /* Taller and lifted: it reads as the destination, not just the other column. */
      margin-block: calc(var(--sp-4) * -1);
      padding-block: calc(var(--sp-8) + var(--sp-4));
      padding-left: calc(var(--sp-8) + 24px);
    }
    .panel--functional .panel-title {
      color: #fff;
    }
    .panel--functional .item .mark {
      background: var(--highlight-blue);
    }
    .panel--functional .item .mark path {
      fill: none;
      stroke: var(--oxblood);
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Where the two meet. */
    .versus {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: grid;
      place-items: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--ivory);
      border: 1px solid var(--rule-on-light);
      box-shadow: var(--shadow-soft);
      font-family: var(--font-mono);
      font-size: 0.85rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: #000;
      z-index: 2;
    }

    /* Each list drops in item by item once the pair is on screen. */
    .item {
      opacity: 0;
      transform: translateY(10px);
      transition:
        opacity var(--dur-base) var(--ease-out-soft),
        transform var(--dur-base) var(--ease-out-soft);
      transition-delay: calc(var(--i) * 55ms);
    }
    .compare.is-visible .item {
      opacity: 1;
      transform: none;
    }

    @media (min-width: 900px) {
      .compare {
        display: grid;
      }
      .points {
        display: none;
      }
    }

    /* ---------- small screens: point by point ---------- */

    .rows {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--sp-6);
    }

    .pair {
      position: relative;
      display: grid;
      grid-template-columns: 28px 1fr;
      column-gap: var(--sp-3);
    }

    /* A thin thread joins one point to the next. */
    .pair::before {
      content: '';
      position: absolute;
      left: 13px;
      top: 30px;
      bottom: calc(var(--sp-6) * -1 + 2px);
      width: 1px;
      background: var(--rule-on-light);
    }
    .pair--last::before,
    .pair:last-child::before {
      display: none;
    }

    .num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid #c8c8c8;
      background: var(--ivory);
      display: grid;
      place-items: center;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: #000;
      position: relative;
      z-index: 1;
    }
    .num--tick {
      background: var(--highlight-blue);
      border-color: var(--highlight-blue);
    }
    .num--tick svg {
      width: 16px;
      height: 16px;
    }
    .num--tick path {
      fill: none;
      stroke: var(--oxblood);
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .pair-body {
      display: grid;
      gap: var(--sp-2);
      min-width: 0;
    }

    /* Every line says which side it is on, so no one has to remember a legend. */
    .tag {
      display: inline-block;
      margin-bottom: 6px;
      padding: 3px 10px;
      border-radius: var(--r-pill);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
    }
    .tag--conv {
      background: #ececec;
      color: #000;
    }
    .tag--func {
      background: var(--highlight-blue);
      color: var(--oxblood);
    }

    .conv {
      padding-top: 2px;
      color: #000;
    }
    .conv-text,
    .func-text {
      margin: 0;
      font-family: var(--font-body);
      font-size: 1rem;
      line-height: 1.4;
    }
    .func-copy {
      min-width: 0;
    }

    .arrow {
      width: 14px;
      height: 20px;
      margin-left: 2px;
    }
    .arrow path {
      fill: none;
      stroke: var(--highlight-blue);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 60;
      stroke-dashoffset: 60;
    }

    .func {
      margin: 0;
      display: flex;
      align-items: flex-start;
      gap: var(--sp-3);
      padding: var(--sp-3) var(--sp-4);
      border-radius: var(--r-sm, 12px);
      background: var(--oxblood);
      color: #fff;
    }
    .func .mark {
      margin-top: 2px;
    }

    /* A point arrives in three quiet beats: the conventional line, the arrow drawing itself, the functional line. */
    .conv,
    .arrow,
    .func {
      opacity: 0;
      transform: translateY(8px);
      transition:
        opacity var(--dur-base) var(--ease-out-soft),
        transform var(--dur-base) var(--ease-out-soft);
    }
    .arrow path {
      transition: stroke-dashoffset 420ms var(--ease-out-soft) 200ms;
    }
    .pair.is-visible .conv {
      opacity: 1;
      transform: none;
    }
    .pair.is-visible .arrow {
      opacity: 1;
      transform: none;
      transition-delay: 160ms;
    }
    .pair.is-visible .arrow path {
      stroke-dashoffset: 0;
    }
    .pair.is-visible .func {
      opacity: 1;
      transform: none;
      transition-delay: 420ms;
    }
    .pair--last .func {
      transition-delay: 0ms;
    }

    @media (prefers-reduced-motion: reduce) {
      .item,
      .conv,
      .arrow,
      .func {
        opacity: 1;
        transform: none;
        transition: none;
      }
      .arrow path {
        stroke-dashoffset: 0;
        transition: none;
      }
    }
  `,
})
export class ApproachCompare {
  protected readonly conventional = CONVENTIONAL;
  protected readonly functional = FUNCTIONAL;
  /** Functional points with no conventional line set against them (the lists are 11 and 12 long). */
  protected readonly extra = FUNCTIONAL.slice(CONVENTIONAL.length);
}
