import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';

export interface PhilosophyPoint {
  readonly title: string;
  readonly body: string;
  readonly image: string;
  readonly imageAlt: string;
}

/** "Our philosophy": every point visible as an alternating image/text row, no carousel or pinned deck. */
@Component({
  selector: 'app-philosophy',
  imports: [NgOptimizedImage, ScrollRevealDirective],
  template: `
    <div class="phil">
      <header class="phil-head">
        <span class="phil-eyebrow">Root-cause, not symptoms</span>
        <h2 class="phil-title" id="hook-heading">Our philosophy</h2>
        <div class="phil-intro">
          <p>Every thought you think sends a message to your body - to heal, to grow, or to remain stuck.</p>
          <p>For every dis-ease, there is a cause. When you remove the cause, the effect cannot remain.</p>
          <p>With the right knowledge and choices - nutrition, lifestyle, and mindset - you can support your body’s natural ability to heal.</p>
          <p class="phil-formula">
            <!-- &ngsp; keeps the spaces: Angular drops whitespace-only text between elements. -->
            <!-- The reveal sits on the inner span: .reveal sets a transform that would undo the centring on the <p>. -->
            <span class="pf-inner reveal" [appScrollReveal]="0"><span class="pf-part">Right Knowledge</span>&ngsp;<span class="pf-part"><span class="pf-op">+</span>&ngsp;Right Action</span>&ngsp;<span class="pf-part"><span class="pf-op">=</span>&ngsp;<span class="pf-goal">Optimum Health.</span></span></span>
          </p>
          <p class="phil-faith">Healing begins the moment you choose FAITH over Fear.</p>
        </div>
      </header>

      <div class="phil-rows">
        @for (point of points(); track point.title; let i = $index) {
          <article class="phil-row reveal" [appScrollReveal]="0" [revealRepeat]="true">
            <div class="phil-media">
              <img [ngSrc]="point.image" fill [alt]="point.imageAlt" />
            </div>
            <div class="phil-copy">
              <span class="phil-num">{{ '0' + (i + 1) }}</span>
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
      font-size: clamp(36px, 5vw, 56px);
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin: 14px 0 0;
      color: #000;
    }
    /* Intro text under the heading; the formula line is a little larger, in the heading font. */
    .phil-intro {
      max-width: 640px;
      margin: 28px auto 0;
    }
    .phil-intro p {
      font-family: var(--font-body);
      font-size: 18px;
      line-height: 1.6;
      color: #000;
      margin: 0 0 12px;
    }
    .phil-intro .phil-formula {
      font-family: var(--font-display);
      font-size: clamp(22px, 2.4vw, 28px);
      line-height: 1.3;
      letter-spacing: -0.01em;
      margin: 26px 0 10px;
    }
    .phil-intro .phil-faith {
      font-style: italic;
      margin-bottom: 0;
    }
    @media (min-width: 761px) {
      /* One line, centred even where it is a little wider than the 640px text column. */
      .phil-intro .phil-formula {
        white-space: nowrap;
        margin-inline: -40px;
      }
    }
    /* Make the formula pop */
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
      background: linear-gradient(135deg, #bf3820, #e06f27);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .pf-goal {
      font-style: italic;
      background-image: linear-gradient(transparent 56%, #00aeef 56%);
      padding: 0 0.08em;
    }
    @media (max-width: 760px) {
      .phil-intro .phil-formula {
        line-height: 1.35;
      }
      .pf-part {
        display: block;
      }
    }

    .phil-row {
      display: grid;
      gap: 64px;
      align-items: center;
      padding: 40px 0;
    }
    /* Scrolling back up plays the reveal in reverse: the row fades out and sinks
       back down. The global .reveal-repeat drops the rise to avoid a flicker at
       the top edge, but the directive only rewinds rows leaving through the
       bottom, where sinking further down is safe, so the rise can stay. */
    .phil-row.reveal-repeat {
      transform: translateY(28px);
    }
    .phil-row.reveal-repeat.is-visible {
      transform: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .phil-row.reveal-repeat {
        transform: none;
      }
    }
    .phil-row + .phil-row {
      border-top: 1px solid #efe6da;
    }
    /* Pictures stay small (340px) so the text gets the room; sides swap every row. */
    .phil-row:nth-child(odd) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 340px);
    }
    .phil-row:nth-child(even) {
      grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
    }
    .phil-row:nth-child(odd) .phil-media {
      order: 2;
    }
    .phil-media {
      position: relative;
      aspect-ratio: 16 / 10;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(33, 56, 72, 0.12);
    }
    .phil-media img {
      object-fit: cover;
    }
    .phil-num {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.18em;
      color: #000;
    }
    .phil-row h3 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(26px, 2.6vw, 34px);
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin: 10px 0 14px;
      color: #000;
    }
    .phil-row p {
      font-family: var(--font-body);
      font-size: 18px;
      line-height: 1.6;
      margin: 0;
      color: #000;
      max-width: 46ch;
    }

    @media (max-width: 760px) {
      .phil {
        padding: 56px 18px 72px;
      }
      .phil-head {
        margin-bottom: 24px;
      }
      .phil-intro {
        margin-top: 20px;
      }
      .phil-intro p {
        font-size: 17px;
      }
      .phil-row,
      .phil-row:nth-child(odd),
      .phil-row:nth-child(even) {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 32px 0;
      }
      .phil-row:nth-child(odd) .phil-media {
        order: 0;
      }
      .phil-media {
        max-width: 240px;
      }
      .phil-row h3 {
        margin: 8px 0 10px;
      }
      .phil-row p {
        font-size: 17px;
      }
    }
  `,
})
export class Philosophy {
  readonly points = input.required<readonly PhilosophyPoint[]>();
}
