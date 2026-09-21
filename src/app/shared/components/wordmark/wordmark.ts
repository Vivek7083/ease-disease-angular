import { Component, DestroyRef, inject, input, signal } from '@angular/core';

const MINIMIZE_THRESHOLD = 64;

@Component({
  selector: 'app-wordmark',
  template: `
    <a class="wordmark" href="#top" [class.on-dark]="onDark()" [class.minimized]="minimized()">
      <span class="wordmark-glyph" aria-hidden="true">
        <svg viewBox="0 0 18 18" fill="none" stroke="#fff4ec" stroke-width="1.6" stroke-linecap="round">
          <path d="M9 3C5 3 3 6 3 9s2 6 6 6 6-2.7 6-6-2-6-6-6Z" opacity="0.7" />
          <path d="M9 6c-2 0-3 2-3 3s1 4 3 4" />
        </svg>
      </span>
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
    .wordmark {
      display: inline-flex;
      align-items: flex-start;
      gap: var(--sp-2);
      text-decoration: none;
      color: var(--ink);
      transition: gap var(--dur-base) var(--ease);
    }
    .wordmark.on-dark {
      color: var(--ivory);
    }
    .wordmark.minimized {
      gap: 0;
    }
    .wordmark-glyph {
      width: 36px;
      height: 36px;
      flex: none;
      border-radius: var(--r-sm);
      display: grid;
      place-items: center;
      background: var(--gradient-ember);
      background-size: 180% 180%;
      animation: ember-drift var(--drift-ember) var(--drift-ease) infinite;
      transition: transform var(--dur-base) var(--ease);
    }
    .wordmark.minimized .wordmark-glyph {
      transform: scale(0.92);
    }
    .wordmark-glyph svg {
      width: 18px;
      height: 18px;
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
        opacity var(--dur-micro) var(--ease);
    }
    .wordmark.minimized .wordmark-text-group {
      max-width: 0;
      opacity: 0;
    }
    .wordmark-text {
      font-family: var(--font-display);
      font-weight: var(--wt-display-bold);
      font-size: 1.05rem;
      letter-spacing: var(--ls-display);
      line-height: 1;
    }
    .wordmark-tagline {
      font-family: var(--font-mono);
      font-size: 0.62rem;
      letter-spacing: 0.08em;
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
      margin-top: 2px;
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
      .wordmark-glyph,
      .wordmark-text-group {
        transition: none;
      }
    }
  `,
})
export class Wordmark {
  private readonly destroyRef = inject(DestroyRef);

  readonly onDark = input(false);
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
