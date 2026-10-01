import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';

/**
 * Matches the design system's CtaPill: `primary` (ember gradient, the only
 * gradient in the system), `ghostDark` (ink text, for the ivory canvas) and
 * `ghostLight` (ivory text, for dark surfaces / the menu overlay).
 */
export type CtaVariant = 'primary' | 'ghostDark' | 'ghostLight';

@Component({
  selector: 'app-cta-pill',
  imports: [NgTemplateOutlet],
  template: `
    <button
      type="button"
      class="cta"
      [class]="variant()"
      [class.compact]="compact()"
      [class.floating]="floating()"
      [class.meta-open]="metaRevealed()"
      (click)="pressed.emit()"
    >
      @if (compact()) {
        <span class="label">{{ label() }}</span>
        @if (durationLabel() || price()) {
          <span class="meta" [class.meta-revealed]="metaRevealed()" aria-hidden="true">
            <ng-container *ngTemplateOutlet="metaContent" />
          </span>
          <span class="sr-only">{{ metaAccessibleText() }}</span>
        }
      } @else if (durationLabel() || price()) {
        <span class="cta-flip">
          <span class="cta-card" [class.is-flipped]="metaRevealed()">
            <span class="cta-face cta-face-front">{{ label() }}</span>
            <span class="cta-face cta-face-back" aria-hidden="true">
              <ng-container *ngTemplateOutlet="metaContent" />
            </span>
          </span>
          <span class="sr-only">{{ metaAccessibleText() }}</span>
        </span>
      } @else {
        <span class="label">{{ label() }}</span>
      }
    </button>

    <ng-template #metaContent>
      @if (durationLabel(); as d) {
        <span class="meta-duration">{{ d }}</span>
      }
      @if (price(); as p) {
        <span class="meta-sep">·</span>
        <span class="price-flip">
          <span class="price-card" [class.is-flipped]="priceFlipped()">
            <span class="price-face price-front">{{ p }}</span>
            @if (originalPrice(); as orig) {
              <span class="price-face price-back">
                <span class="strike-wrap">
                  {{ orig }}
                  <span class="strike-line" [class.drawn]="strikeDrawn()"></span>
                </span>
              </span>
            }
          </span>
        </span>
      }
    </ng-template>
  `,
  styles: `
    .cta {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      min-height: var(--tap-min);
      padding: 0 var(--sp-6);
      border-radius: var(--r-pill);
      border: none;
      font-family: var(--font-body);
      font-weight: 500;
      font-size: 1rem;
      letter-spacing: 0.005em;
      white-space: nowrap;
      cursor: pointer;
      transition:
        transform var(--dur-micro) var(--ease),
        box-shadow var(--dur-base) var(--ease);
    }
    .cta.compact {
      /* Matches the chrome wordmark's own 36px-tall glyph (wordmark.ts) so
         the two sit aligned in the top corner instead of the pill reading
         visibly taller/lower than the logo beside it. 36px stays well above
         WCAG 2.5.8's 24px AA minimum target size. */
      min-height: 36px;
      padding: 0 var(--sp-4);
      font-size: 0.86rem;
      gap: var(--sp-2);
    }
    .cta:hover {
      transform: translateY(-1px);
    }
    .cta:active {
      transform: scale(0.98);
    }
    /* Only the compact chrome pill uses this: rests as just the label, and
       unfurls sideways to show "30 min · ₹499" during its one-time reveal
       (see scheduleReveal), then collapses back. Every other pill uses the
       whole-button card-flip below instead, so it never changes width. */
    .cta.compact .meta {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      max-width: 0;
      padding-left: 0;
      border-left: 0px solid currentColor;
      opacity: 0;
      overflow: hidden;
      white-space: nowrap;
      transition:
        max-width 420ms var(--ease-out-soft),
        opacity 240ms linear,
        padding-left 420ms var(--ease-out-soft),
        border-left-width 420ms var(--ease-out-soft);
    }
    .cta.compact .meta.meta-revealed {
      max-width: 220px;
      padding-left: var(--sp-3);
      border-left-width: 1px;
      opacity: 0.85;
    }
    @media (prefers-reduced-motion: reduce) {
      .cta.compact .meta {
        transition: none;
      }
    }
    /* Every other pill: the whole button content flips over, front (label)
       to back (duration + price) — the button is sized to fit the wider of
       the two faces and never changes size, so revealing never "grows" it. */
    .cta-flip {
      display: inline-grid;
      perspective: 480px;
      vertical-align: middle;
    }
    .cta-card {
      grid-area: 1 / 1;
      display: grid;
      transform-style: preserve-3d;
      transition: transform 500ms var(--ease-out-soft);
    }
    .cta-card.is-flipped {
      transform: rotateX(180deg);
    }
    .cta-face {
      grid-area: 1 / 1;
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      backface-visibility: hidden;
      white-space: nowrap;
    }
    .cta-face-front {
      font-family: inherit;
      font-size: inherit;
      letter-spacing: inherit;
    }
    .cta-face-back {
      transform: rotateX(180deg);
      opacity: 0.85;
    }
    /* On a device that actually has hover, hovering/focusing flips the
       button over on demand — it shows the settled ₹499 plainly (not a
       replay of the one-time ₹999 scratch, which only ever plays once per
       visitor regardless of how often this is hovered). */
    @media (hover: hover) and (pointer: fine) {
      .cta:hover .cta-card:not(.is-flipped),
      .cta:focus-visible .cta-card:not(.is-flipped) {
        transform: rotateX(180deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .cta-card {
        transition: none;
      }
    }
    .meta-sep {
      opacity: 0.6;
    }
    /* The price "turns over" on its own, on a long, randomized timer — it is
       a passive, ambient price-anchor (show ₹999, settle on ₹499), not an
       interaction affordance, so it has to work identically with no hover
       or press at all, which is what actually fixes this on touch devices. */
    .price-flip {
      display: inline-grid;
      perspective: 240px;
      vertical-align: middle;
    }
    .price-card {
      grid-area: 1 / 1;
      display: grid;
      transform-style: preserve-3d;
      transition: transform 420ms var(--ease-out-soft);
    }
    .price-card.is-flipped {
      transform: rotateX(180deg);
    }
    .price-face {
      grid-area: 1 / 1;
      backface-visibility: hidden;
      white-space: nowrap;
    }
    .price-face.price-back {
      transform: rotateX(180deg);
      opacity: 0.72;
    }
    .strike-wrap {
      position: relative;
      display: inline-block;
    }
    .strike-line {
      position: absolute;
      left: -1px;
      right: -1px;
      top: 50%;
      height: 1.5px;
      background: currentColor;
      transform: scaleX(0);
      transform-origin: left;
      /* Matches CtaPill.STRIKE_DRAW_MS exactly — the scratch is driven by a
         single shared timing everywhere it appears. */
      transition: transform 2000ms linear;
    }
    .strike-line.drawn {
      transform: scaleX(1);
    }
    @media (prefers-reduced-motion: reduce) {
      .strike-line {
        transition: none;
      }
      .price-card {
        transition: none;
        transform: none !important;
      }
      .price-face {
        transition: opacity 200ms linear;
      }
      .price-face.price-back {
        transform: none;
        opacity: 0;
      }
      .price-card.is-flipped .price-face.price-front {
        opacity: 0;
      }
      .price-card.is-flipped .price-face.price-back {
        opacity: 1;
      }
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
    .primary {
      color: var(--ivory);
      /* The design system's one sanctioned gradient (colors.css) — terracotta
         easing through ember, kept to this single token so every primary CTA
         on the site shares the exact same gradient rather than each button
         rolling its own. */
      background-image: var(--gradient-ember);
      box-shadow: 0 10px 24px -12px color-mix(in oklab, var(--terracotta) 70%, transparent);
    }
    .primary:hover {
      box-shadow: 0 14px 30px -12px color-mix(in oklab, var(--terracotta) 80%, transparent);
    }
    .primary .meta {
      border-left-color: rgba(251, 247, 240, 0.42);
    }
    .ghostLight {
      color: var(--ivory);
      background: var(--surface-glass-dark);
      box-shadow: inset 0 0 0 1px rgba(251, 247, 240, 0.38);
    }
    .ghostDark {
      color: var(--oxblood-deep);
      background: color-mix(in oklab, var(--terracotta) 8%, transparent);
      box-shadow: inset 0 0 0 1.5px color-mix(in oklab, var(--terracotta) 55%, var(--oxblood));
    }
    .ghostDark:hover {
      background: color-mix(in oklab, var(--terracotta) 14%, transparent);
    }
    .floating {
      position: fixed;
      right: var(--sp-6);
      bottom: var(--sp-6);
      z-index: 40;
    }
    /* Narrow phones: label + meta together at nowrap width (eg. "Book your
       first consultation" · "30 min · ₹499") run wider than a 320-375px
       container with its 20px gutters, forcing the page to scroll
       horizontally. Below 400px the button wraps onto two centered lines
       instead of holding one unbroken row. */
    @media (max-width: 400px) {
      .cta {
        flex-wrap: wrap;
        justify-content: center;
        white-space: normal;
        text-align: center;
        row-gap: 2px;
        padding-block: var(--sp-3);
      }
      .meta {
        flex-basis: 100%;
        padding-left: 0;
        border-left: none;
        justify-content: center;
      }
    }
    /* The compact chrome pill lives permanently in the top corner, so at
       narrow widths its reveal grows a second line underneath instead of
       widening sideways (there's no room to grow into) — a dedicated
       vertical-stack layout, rather than the horizontal unfurl every other
       pill (and this one, above 480px) uses. */
    @media (max-width: 480px) {
      .cta.compact {
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        gap: 0;
        padding: var(--sp-2);
        text-align: center;
        transition: padding-inline 260ms var(--ease-out-soft);
      }
      /* "₹999 · 30 min" is wider than "Book now" — the tight 2px resting
         padding would crowd it right up to the pill's edge, so the sides
         ease open in step with the meta reveal below instead of staying
         fixed. */
      .cta.compact.meta-open {
        padding-inline: var(--sp-4);
      }
      .cta.compact .meta {
        padding-left: 0;
        border-left: none;
        font-size: 0.76rem;
        gap: var(--sp-1);
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition:
          max-height 260ms var(--ease-out-soft),
          opacity 200ms linear,
          margin-top 260ms var(--ease-out-soft);
      }
      .cta.compact .meta.meta-revealed {
        max-height: 1.4em;
        max-width: none;
        opacity: 1;
        margin-top: 2px;
      }
      /* Lead with the price — the turnover is the part worth noticing,
         "30 min" is secondary context after it. */
      .cta.compact .price-flip {
        order: 1;
      }
      .cta.compact .meta-sep {
        order: 2;
      }
      .cta.compact .meta-duration {
        order: 3;
      }
    }
    @media (max-width: 480px) and (prefers-reduced-motion: reduce) {
      .cta.compact {
        transition: none;
      }
      .cta.compact .meta {
        transition: none;
      }
    }
  `,
})
export class CtaPill implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input('Book a consultation');
  readonly durationLabel = input<string | undefined>(undefined);
  readonly price = input<string | undefined>(undefined);
  readonly originalPrice = input<string | undefined>(undefined);
  /** Distinguishes this pill's one-time reveal from every other pill's on
   *  the page — required whenever `price`/`originalPrice` are set, since
   *  several pills can share the same label. */
  readonly revealKey = input<string | undefined>(undefined);
  readonly variant = input<CtaVariant>('primary');
  readonly compact = input(false);
  readonly floating = input(false);
  readonly pressed = output<void>();

  protected readonly priceFlipped = signal(false);
  protected readonly strikeDrawn = signal(false);
  protected readonly metaRevealed = signal(false);

  protected readonly metaAccessibleText = () => [this.durationLabel(), this.price()].filter(Boolean).join(' · ');

  private static readonly CYCLE_MIN_INTERVAL_MS = 10_000;
  private static readonly CYCLE_MAX_INTERVAL_MS = 20_000;
  /** Total time the reveal stays on screen, start to collapse. */
  private static readonly CYCLE_VISIBLE_MS = 5_000;
  /** Scratch begins the instant the ₹999 text appears — no pause first. */
  private static readonly PRE_STRIKE_MS = 0;
  private static readonly STRIKE_DRAW_MS = 2_000;
  private static readonly SETTLE_HOLD_MS = CtaPill.CYCLE_VISIBLE_MS - CtaPill.PRE_STRIKE_MS - CtaPill.STRIKE_DRAW_MS;
  private flipTimer: ReturnType<typeof setTimeout> | undefined;

  private static readonly STORAGE_PREFIX = 'ed-price-reveal:';

  ngOnInit(): void {
    if (!this.price() || !this.originalPrice()) return;
    const key = this.revealKey();
    if (!key || this.hasPlayed(key)) return;
    this.scheduleReveal(key);
    this.destroyRef.onDestroy(() => clearTimeout(this.flipTimer));
  }

  private hasPlayed(key: string): boolean {
    if (typeof window === 'undefined') return true;
    try {
      return window.localStorage.getItem(CtaPill.STORAGE_PREFIX + key) === '1';
    } catch {
      return false;
    }
  }

  private markPlayed(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(CtaPill.STORAGE_PREFIX + key, '1');
    } catch {
      /* private browsing / quota — not worth failing over, it'll just replay next visit */
    }
  }

  /** Every price pill: rests as just the label, then — once, on a visitor's
   *  first visit only — reveals "30 min · ₹999", scratches the ₹999 off,
   *  settles on ₹499, holds a moment, and collapses back down to just the
   *  label again for good. */
  private scheduleReveal(key: string): void {
    const delay = this.randomCycleDelay();
    this.flipTimer = setTimeout(() => {
      this.metaRevealed.set(true);
      this.priceFlipped.set(true);
      this.flipTimer = setTimeout(() => {
        this.strikeDrawn.set(true);
        this.flipTimer = setTimeout(() => {
          this.priceFlipped.set(false);
          this.strikeDrawn.set(false);
          this.flipTimer = setTimeout(() => {
            this.metaRevealed.set(false);
            this.markPlayed(key);
          }, CtaPill.SETTLE_HOLD_MS);
        }, CtaPill.STRIKE_DRAW_MS);
      }, CtaPill.PRE_STRIKE_MS);
    }, delay);
  }

  private randomCycleDelay(): number {
    return CtaPill.CYCLE_MIN_INTERVAL_MS + Math.random() * (CtaPill.CYCLE_MAX_INTERVAL_MS - CtaPill.CYCLE_MIN_INTERVAL_MS);
  }
}
