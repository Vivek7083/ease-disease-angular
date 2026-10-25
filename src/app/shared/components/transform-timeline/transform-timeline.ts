import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';

export interface TimelineStep {
  readonly title: string;
  readonly body: string;
  readonly image: string;
  readonly imageAlt: string;
}

/** "Transform with E.A.S.E": four steps on a simple timeline, horizontal on desktop and vertical below 900px. */
@Component({
  selector: 'app-transform-timeline',
  imports: [NgOptimizedImage, ScrollRevealDirective],
  template: `
    <div class="tl">
      <header class="tl-head">
        <span class="tl-eyebrow">Built with you, not just for you</span>
        <h2 class="tl-title" id="treat-heading">Transform with <span class="tl-ease">E.A.S.E</span></h2>
        <p class="tl-sub">Physically, mentally and emotionally.</p>
      </header>

      <ol class="tl-steps">
        @for (step of steps(); track step.title; let i = $index) {
          <li class="tl-step reveal" [appScrollReveal]="i * 160">
            <span class="tl-dot" aria-hidden="true">{{ '0' + (i + 1) }}</span>
            <span class="tl-label">Step {{ i + 1 }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
            <div class="tl-media">
              <img [ngSrc]="step.image" fill [alt]="step.imageAlt" />
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
    .tl {
      max-width: 1180px;
      margin: 0 auto;
      padding: 72px 20px 96px;
    }
    .tl-head {
      text-align: center;
      margin-bottom: 64px;
    }
    .tl-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-family: var(--font-mono);
      font-size: 12.3px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #000;
    }
    .tl-eyebrow::before {
      content: '';
      width: 36px;
      height: 1px;
      background: #cfdce6;
    }
    .tl-title {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: var(--fs-heading);
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin: 14px 0 12px;
      color: #000;
    }
    /* The brand word: burgundy with a burgundy underline. */
    .tl-ease {
      color: var(--oxblood);
      text-decoration: underline;
      text-decoration-thickness: 3px;
      text-underline-offset: 8px;
    }
    .tl-sub {
      font-family: var(--font-body);
      font-size: 18px;
      line-height: 1.5;
      margin: 0 auto;
      max-width: 52ch;
      color: #000;
    }

    .tl-steps {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 32px;
      position: relative;
    }
    /* The line runs through the middle of the four dots, in the warm gradient. */
    .tl-steps::before {
      content: '';
      position: absolute;
      top: 23px;
      left: 12.5%;
      right: 12.5%;
      height: 2px;
      background: linear-gradient(90deg, var(--ember-a), var(--ember-b));
    }
    .tl-step {
      position: relative;
      text-align: center;
    }
    .tl-dot {
      position: relative;
      z-index: 1;
      width: 48px;
      height: 48px;
      margin: 0 auto 22px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--oxblood);
      color: #fff;
      font-family: var(--font-mono);
      font-size: 15px;
      letter-spacing: 0.04em;
      /* The ring matches the ivory page background so the line looks cut behind the dot. */
      box-shadow:
        0 0 0 6px var(--ivory),
        0 0 0 7px #cfdce6;
    }
    .tl-label {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #000;
    }
    .tl-step h3 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(22px, 2vw, 26px);
      line-height: 1.2;
      letter-spacing: -0.01em;
      margin: 8px 0 10px;
      color: #000;
    }
    .tl-step p {
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.55;
      margin: 0 auto;
      max-width: 30ch;
      color: #000;
    }
    .tl-media {
      position: relative;
      margin: 20px auto 0;
      max-width: 260px;
      aspect-ratio: 4 / 3;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid rgba(33, 56, 72, 0.12);
    }
    .tl-media img {
      object-fit: cover;
    }

    @media (max-width: 900px) {
      .tl {
        padding: 56px 18px 72px;
      }
      .tl-head {
        text-align: left;
        margin-bottom: 36px;
      }
      .tl-sub {
        margin: 0;
        font-size: 17px;
      }
      .tl-steps {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .tl-steps::before {
        top: 24px;
        bottom: 24px;
        left: 23px;
        right: auto;
        width: 2px;
        height: auto;
        background: linear-gradient(180deg, var(--ember-a), var(--ember-b));
      }
      .tl-step {
        text-align: left;
        padding: 0 0 40px 72px;
      }
      .tl-step:last-child {
        padding-bottom: 0;
      }
      .tl-dot {
        position: absolute;
        left: 0;
        top: 0;
        margin: 0;
      }
      .tl-label {
        display: block;
        padding-top: 14px;
      }
      .tl-step p {
        margin: 0;
        max-width: none;
        font-size: 16.5px;
      }
      .tl-media {
        margin: 16px 0 0;
        max-width: 240px;
      }
    }

    /* Small phones: keep the eyebrow label on one line. */
    @media (max-width: 480px) {
      .tl-eyebrow {
        font-size: 11.5px;
        letter-spacing: 0.1em;
        gap: 10px;
        white-space: nowrap;
      }
      .tl-eyebrow::before {
        width: 24px;
      }
    }
  `,
})
export class TransformTimeline {
  readonly steps = input.required<readonly TimelineStep[]>();
}
