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
