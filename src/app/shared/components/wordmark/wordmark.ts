import { NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

const MINIMIZE_THRESHOLD = 64;

@Component({
  selector: 'app-wordmark',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <a class="wordmark" routerLink="/" fragment="top" aria-label="Ease Dis-ease — back to top" [class.on-dark]="onDark()" [class.minimized]="collapse() && minimized()">
      <img class="wordmark-logo" [ngSrc]="onDark() ? 'images/logo/logo-white.png' : 'images/logo/logo-transparent.png'" width="43" height="43" priority alt="" />
      <span class="wordmark-text-group">
        <span class="wordmark-text">Ease Dis-<span class="ease-mark">ease</span></span>
        @if (tagline(); as t) {
          <span class="wordmark-tagline" [attr.aria-label]="t">
            @for (c of taglineChars(); track $index) {
              <span aria-hidden="true" [class.gap]="c === ' '">{{ c }}</span>
            }
          </span>
        }
        <span class="wordmark-rule" aria-hidden="true">
          <span class="line"></span>
          <span class="dot"></span>
          <span class="line"></span>
        </span>
      </span>
    </a>
  `,
  styles: `
    /* On the light canvas the transparent logo sits straight on the page
       beside the name. On the dark footer the logo's dark reds would sink into
       the background, so it is set as a round ivory badge instead (its own
       white background, clipped to a circle) with the name in ivory beside it. */
    /* Every size below is in em off this one value, so the logo, name, subtext
       and gaps scale together. It tracks viewport width (clamped) so the
       wordmark keeps the same proportion on a 1280px Windows window at 150%
       display scaling and on a wide Mac window. */
    .wordmark {
      font-size: clamp(1.05rem, 0.25rem + 1.1vw, 1.5rem);
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      color: var(--ink);
      text-decoration: none;
      transition: gap var(--dur-base) var(--ease);
    }
    /* Desktop Mac (class set in main.ts): the logo-to-text gap at 110%, as at
       110% browser zoom. The font size needs no Mac override: measured in
       Chromium, 110% zoom at 1440px gives 4px*1.1 + 1.1vw, which the base
       clamp() above already matches to within 0.4px. */
    :host-context(html.is-mac) .wordmark {
      gap: calc(var(--sp-2) * 1.1);
    }
    .wordmark.on-dark {
      color: var(--ivory);
    }
    .wordmark.minimized {
      gap: 0;
    }
    .wordmark:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
      border-radius: var(--r-sm);
    }
    .wordmark-logo {
      flex: none;
      width: 2.25em;
      height: 2.25em;
      display: block;
      transition: transform var(--dur-base) var(--ease);
    }
    .wordmark.on-dark .wordmark-logo {
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(251, 247, 240, 0.3);
    }
    .wordmark.minimized .wordmark-logo {
      transform: scale(0.92);
    }
    .wordmark-text-group {
      display: flex;
      flex-direction: column;
      gap: 0.4em;
      max-width: 14em;
      opacity: 1;
      overflow: hidden;
      white-space: nowrap;
      transition:
        max-width var(--dur-base) var(--ease),
        padding var(--dur-base) var(--ease),
        opacity var(--dur-micro) var(--ease);
    }
    .wordmark.minimized .wordmark-text-group {
      max-width: 0;
      opacity: 0;
    }
    .wordmark-text {
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 1em;
      letter-spacing: var(--ls-display);
      line-height: 1;
      text-transform: uppercase;
    }
    .wordmark-tagline {
      font-family: var(--font-mono);
      font-size: 0.48em;
      line-height: 1;
      text-transform: uppercase;
      color: var(--text-quiet-light);
      /* One flex item per letter, spread edge to edge: the subtext always spans
         the name's width, whatever the browser's font metrics. */
      display: flex;
      justify-content: space-between;
    }
    .wordmark-tagline .gap {
      width: 0.5em;
    }
    .on-dark .wordmark-tagline {
      color: var(--text-quiet-dark);
    }
    .wordmark-rule {
      display: flex;
      align-items: center;
      gap: 0.3em;
    }
    .wordmark-rule .line {
      width: 0.85em;
      height: 1px;
      background: color-mix(in oklab, currentColor 25%, transparent);
      display: block;
    }
    .wordmark-rule .dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--oxblood);
      display: block;
      flex: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .wordmark,
      .wordmark-logo,
      .wordmark-text-group {
        transition: none;
      }
    }
  `,
})
export class Wordmark {
  private readonly destroyRef = inject(DestroyRef);

  readonly onDark = input(false);
  /** Shrinks to just the logo once the page scrolls — off for the footer, which is only ever seen scrolled. */
  readonly collapse = input(true);
  readonly tagline = input<string | undefined>('Functional Medicine');

  readonly taglineChars = computed(() => [...(this.tagline() ?? '')]);

  readonly minimized = signal(false);

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const onScroll = () => this.minimized.set(window.scrollY > MINIMIZE_THRESHOLD);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }
}
