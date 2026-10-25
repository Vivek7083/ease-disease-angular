import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';

export interface PhilosophyPoint {
  readonly title: string;
  readonly body: string;
}

/**
 * "Our philosophy", set as a page worth stopping on: the title on the left beside
 * three ruled statements, the formula alone in a quiet band across the full width,
 * then the four points as numbered cards. Everything shares the other sections'
 * left and right edges.
 */
@Component({
  selector: 'app-philosophy',
  imports: [ScrollRevealDirective],
  template: `
    <div class="phil">
      <header class="phil-head">
        <div class="phil-title-block reveal" [appScrollReveal]="0">
          <span class="phil-eyebrow">Root-cause, not symptoms</span>
          <h2 class="phil-title" id="hook-heading">Our <span class="accent">Philosophy</span></h2>
          <span class="phil-underline" aria-hidden="true"></span>
        </div>
        <ul class="phil-lines">
          <li class="reveal" [appScrollReveal]="0">Every thought you think sends a message to your body - to heal, to grow, or to remain stuck.</li>
          <li class="reveal" [appScrollReveal]="120">For every dis-ease, there is a cause. When you remove the cause, the effect cannot remain.</li>
          <li class="reveal" [appScrollReveal]="240">With the right knowledge and choices - nutrition, lifestyle, and mindset - you can support your body’s natural ability to heal.</li>
        </ul>
      </header>

      <div class="phil-band reveal" [appScrollReveal]="0">
        <p class="phil-formula">
          <!-- &ngsp; keeps the spaces: Angular drops whitespace-only text between elements. -->
          <span class="pf-part">Right Knowledge</span>&ngsp;<span class="pf-part"><span class="pf-op">+</span>&ngsp;Right Action</span>&ngsp;<span class="pf-part"><span class="pf-op">=</span>&ngsp;<span class="pf-goal">Optimum Health.</span></span>
        </p>
        <p class="phil-faith">Healing begins the moment you choose FAITH over Fear.</p>
      </div>

      <div class="phil-cards">
        @for (point of points(); track point.title; let i = $index) {
          <article class="phil-card reveal" [appScrollReveal]="0" [revealRepeat]="true">
            <span class="phil-num" aria-hidden="true">{{ '0' + (i + 1) }}</span>
            <div class="phil-copy">
              <h3>{{ point.title }}</h3>
              <p>{{ point.body }}</p>
            </div>
          </article>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    /* Same left and right edges as every other section; the section's own padding gives the space above and below. */
    .phil {
      max-width: var(--container-max);
      margin: 0 auto;
      padding-inline: var(--gutter-mobile);
    }
    @media (min-width: 900px) {
      .phil {
        padding-inline: var(--gutter-desktop);
      }
    }
    .accent {
      color: var(--oxblood);
    }

    /* ---------- title beside the three statements ---------- */
    .phil-head {
      display: grid;
      gap: 36px;
    }
    @media (min-width: 900px) {
      .phil-head {
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
        gap: 72px;
        align-items: start;
      }
    }
    .phil-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-family: var(--font-mono);
      font-size: 12.3px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #000;
    }
    .phil-eyebrow::before {
      content: '';
      width: 36px;
      height: 1px;
      background: var(--rule-on-light);
    }
    .phil-title {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: var(--fs-heading);
      line-height: 1.08;
      letter-spacing: -0.02em;
      margin: 16px 0 0;
      color: #000;
    }
    .phil-underline {
      display: block;
      width: 64px;
      height: 3px;
      margin-top: 26px;
      border-radius: 2px;
      background: var(--gradient-ember);
    }

    /* Three statements, each between hairlines with a small burgundy diamond. */
    .phil-lines {
      list-style: none;
      margin: 0;
      padding: 0;
      border-bottom: 1px solid var(--rule-on-light);
    }
    .phil-lines li {
      position: relative;
      padding: 24px 0 24px 32px;
      border-top: 1px solid var(--rule-on-light);
      font-family: var(--font-body);
      font-size: clamp(18px, 1.1vw + 11px, 22px);
      line-height: 1.55;
      color: #000;
    }
    .phil-lines li::before {
      content: '';
      position: absolute;
      left: 4px;
      top: calc(24px + 0.78em);
      width: 8px;
      height: 8px;
      background: var(--oxblood);
      transform: translateY(-50%) rotate(45deg);
    }

    /* ---------- the formula, alone in a quiet band ---------- */
    .phil-band {
      margin-top: 56px;
      padding: clamp(40px, 5vw, 72px) 24px;
      border-radius: var(--r-lg);
      border: 1px solid var(--rule-on-light);
      background: color-mix(in oklab, var(--parchment) 45%, var(--ivory));
      text-align: center;
    }
    .phil-formula {
      margin: 0;
      font-family: Fraunces, Georgia, serif;
      font-size: clamp(28px, 3.4vw, 48px);
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: #000;
    }
    .pf-part {
      white-space: nowrap;
    }
    .pf-op {
      display: inline-block;
      margin: 0 0.18em;
      font-weight: 500;
      background: var(--gradient-ember);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .pf-goal {
      font-style: italic;
      background-image: linear-gradient(transparent 56%, var(--highlight-blue) 56%);
      padding: 0 0.08em;
    }
    .phil-faith {
      margin: 22px 0 0;
      font-family: var(--font-body);
      font-size: clamp(17px, 0.6vw + 13px, 20px);
      font-style: italic;
      color: #000;
    }
    @media (max-width: 760px) {
      .pf-part {
        display: block;
      }
    }

    /* ---------- the four points: wide numbered cards in one column ---------- */
    .phil-cards {
      display: grid;
      gap: 20px;
      margin-top: 56px;
    }
    .phil-card {
      display: grid;
      grid-template-columns: 112px minmax(0, 1fr);
      gap: 0 32px;
      align-items: start;
      padding: 36px 44px 36px 36px;
      background: var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-soft);
    }
    /* Scrolling back up plays the reveal in reverse: the card fades out and sinks
       back down. The global .reveal-repeat drops the rise to avoid a flicker at
       the top edge, but the directive only rewinds cards leaving through the
       bottom, where sinking further down is safe, so the rise can stay. */
    .phil-card.reveal-repeat {
      transform: translateY(28px);
    }
    .phil-card.reveal-repeat.is-visible {
      transform: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .phil-card.reveal-repeat {
        transform: none;
      }
    }
    .phil-num {
      padding-right: 28px;
      border-right: 1px solid var(--rule-on-light);
      font-family: var(--font-display);
      font-size: clamp(44px, 5vw, 64px);
      line-height: 1;
      letter-spacing: -0.02em;
      color: var(--oxblood);
    }
    .phil-card h3 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(26px, 2.6vw, 34px);
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin: 0 0 12px;
      color: #000;
    }
    .phil-card p {
      font-family: var(--font-body);
      font-size: 18px;
      line-height: 1.65;
      margin: 0;
      color: #000;
      max-width: 90ch;
    }

    @media (max-width: 760px) {
      .phil-lines li {
        padding: 20px 0 20px 28px;
      }
      .phil-lines li::before {
        top: calc(20px + 0.78em);
      }
      .phil-band {
        margin-top: 40px;
      }
      .phil-cards {
        margin-top: 40px;
      }
      .phil-card {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 24px 22px;
      }
      .phil-num {
        padding-right: 0;
        border-right: 0;
        font-size: 40px;
      }
      .phil-card p {
        font-size: 17px;
      }
    }
  `,
})
export class Philosophy {
  readonly points = input.required<readonly PhilosophyPoint[]>();
}
