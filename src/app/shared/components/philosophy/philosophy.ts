import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';

export interface PhilosophyPoint {
  readonly title: string;
  readonly body: string;
}

/** "Our philosophy": a short intro, then every point as a numbered card in a plain vertical stack - no carousel, no pinned deck. */
@Component({
  selector: 'app-philosophy',
  imports: [ScrollRevealDirective],
  template: `
    <div class="phil">
      <header class="phil-head">
        <span class="phil-eyebrow">Root-cause, not symptoms</span>
        <h2 class="phil-title" id="hook-heading">Our <span class="accent">Philosophy</span></h2>
        <div class="phil-intro">
          <ul class="phil-lines">
            <li>Every thought you think sends a message to your body - to heal, to grow, or to remain stuck.</li>
            <li>For every dis-ease, there is a cause. When you remove the cause, the effect cannot remain.</li>
            <li>With the right knowledge and choices - nutrition, lifestyle, and mindset - you can support your body’s natural ability to heal.</li>
          </ul>
          <p class="phil-formula">
            <!-- &ngsp; keeps the spaces: Angular drops whitespace-only text between elements. -->
            <!-- The reveal sits on the inner span: .reveal sets a transform that would undo the centring on the <p>. -->
            <span class="pf-inner reveal" [appScrollReveal]="0"><span class="pf-part">Right Knowledge</span>&ngsp;<span class="pf-part"><span class="pf-op">+</span>&ngsp;Right Action</span>&ngsp;<span class="pf-part"><span class="pf-op">=</span>&ngsp;<span class="pf-goal">Optimum Health.</span></span></span>
          </p>
          <p class="phil-faith">Healing begins the moment you choose FAITH over Fear.</p>
        </div>
      </header>

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
    .phil {
      max-width: 1080px;
      margin: 0 auto;
      padding: 72px 18px 96px;
    }
    .phil-head {
      text-align: center;
      margin-bottom: 56px;
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
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin: 14px 0 0;
      color: #000;
    }
    .accent {
      color: var(--oxblood);
    }

    /* Intro: three short lines, each set off by a small diamond marker. */
    .phil-intro {
      max-width: 640px;
      margin: 28px auto 0;
    }
    .phil-lines {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 22px;
    }
    .phil-lines li {
      font-family: var(--font-body);
      font-size: 18px;
      line-height: 1.6;
      color: #000;
    }
    .phil-lines li::before {
      content: '';
      display: block;
      width: 7px;
      height: 7px;
      margin: 0 auto 10px;
      background: var(--oxblood);
      transform: rotate(45deg);
    }
    .phil-intro p {
      font-family: var(--font-body);
      font-size: 18px;
      line-height: 1.6;
      color: #000;
      margin: 0 0 12px;
    }
    .phil-intro .phil-faith {
      font-style: italic;
      margin-bottom: 0;
    }
    /* Make the formula pop; one line where there is room, centred even where it is wider than the text column. */
    .phil-intro .phil-formula {
      position: relative;
      left: 50%;
      transform: translateX(-50%);
      width: max-content;
      max-width: calc(100vw - 36px);
      margin: 36px 0 18px;
      padding: 18px 8px;
      font-family: Fraunces, Georgia, serif;
      font-size: clamp(28px, 3.2vw, 42px);
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: #000;
      white-space: normal;
      text-align: center;
    }
    .pf-inner {
      display: block;
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
    @media (min-width: 761px) {
      .phil-intro .phil-formula {
        white-space: nowrap;
      }
    }
    @media (max-width: 760px) {
      .phil-intro .phil-formula {
        line-height: 1.35;
      }
      .pf-part {
        display: block;
      }
    }

    /* The four points: wide numbered cards in one column. */
    .phil-cards {
      display: grid;
      gap: 20px;
    }
    .phil-card {
      display: grid;
      grid-template-columns: 96px minmax(0, 1fr);
      gap: 28px;
      align-items: start;
      padding: 36px 40px;
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
      line-height: 1.6;
      margin: 0;
      color: #000;
      max-width: 62ch;
    }

    @media (max-width: 760px) {
      .phil {
        padding: 56px 18px 72px;
      }
      .phil-head {
        margin-bottom: 32px;
      }
      .phil-intro {
        margin-top: 20px;
      }
      .phil-lines li {
        font-size: 17px;
      }
      .phil-card {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 24px 22px;
      }
      .phil-num {
        font-size: 40px;
      }
      .phil-card p {
        font-size: 17px;
      }
    }

    /* MacBook-width screens (13/14/16 inch, about 1280 to 1728px): the section already
       has its own padding above and below, so the extra 72px and 96px made the gap to the
       next section far larger than every other seam on the page. */
    @media (min-width: 1280px) and (max-width: 1728px) {
      .phil {
        padding-block: 32px 24px;
      }
    }
  `,
})
export class Philosophy {
  readonly points = input.required<readonly PhilosophyPoint[]>();
}
