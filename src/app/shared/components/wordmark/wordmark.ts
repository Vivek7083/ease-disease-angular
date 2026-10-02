import { NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, input, signal } from '@angular/core';

const MINIMIZE_THRESHOLD = 64;

@Component({
  selector: 'app-wordmark',
  imports: [NgOptimizedImage],
  template: `
    <a class="wordmark" href="#top" aria-label="Ease Disease — back to top" [class.on-dark]="onDark()" [class.minimized]="collapse() && minimized()">
      <img class="wordmark-logo" [ngSrc]="onDark() ? 'images/logo/logo-white.png' : 'images/logo/logo-transparent.png'" width="36" height="36" priority alt="" />
      <span class="wordmark-text-group">
        <span class="wordmark-text">Ease Disease</span>
        @if (tagline(); as t) {
          <span class="wordmark-tagline">{{ t }}</span>
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
    .wordmark {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      color: var(--ink);
      text-decoration: none;
      transition: gap var(--dur-base) var(--ease);
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
      width: 36px;
      height: 36px;
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
      gap: 2px;
      max-width: 200px;
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
      font-family: var(--font-display);
      font-weight: var(--wt-display-bold);
      font-size: 1rem;
      letter-spacing: var(--ls-display);
      line-height: 1;
    }
    .wordmark-tagline {
      font-family: var(--font-mono);
      font-size: 0.58rem;
      letter-spacing: 0.08em;
      line-height: 1;
      text-transform: uppercase;
      color: var(--text-quiet-light);
    }
    .on-dark .wordmark-tagline {
      color: var(--text-quiet-dark);
    }
    .wordmark-rule {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .wordmark-rule .line {
      width: 16px;
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
