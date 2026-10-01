import { Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';

/**
 * Matches the design system's CtaPill: `primary` (ember gradient, the only
 * gradient in the system), `ghostDark` (ink text, for the ivory canvas) and
 * `ghostLight` (ivory text, for dark surfaces / the menu overlay).
 */
export type CtaVariant = 'primary' | 'ghostDark' | 'ghostLight';

@Component({
  selector: 'app-cta-pill',
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
      <span class="label">{{ label() }}</span>
      @if (durationLabel() || price()) {
        <span class="meta" [class.meta-revealed]="metaRevealed()" aria-hidden="true">
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
        </span>
        <span class="sr-only">{{ metaAccessibleText() }}</span>
      }
    </button>
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
    .meta {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      padding-left: var(--sp-3);
      border-left: 1px solid currentColor;
      opacity: 0.85;
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
      transition: transform 450ms var(--ease-out-soft);
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
       narrow widths it rests as just "Book now" — small, single line, same
       size as the logo beside it — and only grows a second line for the
       few seconds its price-reveal cycle is actually playing (see
       scheduleCompactCycle). That cycle is what makes the pill "big" for a
       moment; collapsing fully back down afterwards is what keeps it from
       looking oddly oversized the rest of the time. */
    @media (max-width: 480px) {
      .cta.compact {
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        gap: 0;
        padding: var(--sp-2) 2px;
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
        opacity: 1;
        margin-top: 2px;
      }
      /* The scratch-off takes noticeably longer here than the standard
         cycle's quick flip — it's the whole point of the compact reveal, so
         it gets room to read as a deliberate "scratching off" motion rather
         than a snap. */
      .cta.compact .strike-line {
        transition: transform 2000ms linear;
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
  readonly variant = input<CtaVariant>('primary');
  readonly compact = input(false);
  readonly floating = input(false);
  readonly pressed = output<void>();

  protected readonly priceFlipped = signal(false);
  protected readonly strikeDrawn = signal(false);
  protected readonly metaRevealed = signal(true);

  protected readonly metaAccessibleText = () => [this.durationLabel(), this.price()].filter(Boolean).join(' · ');

  private static readonly CYCLE_MIN_INTERVAL_MS = 10_000;
  private static readonly CYCLE_MAX_INTERVAL_MS = 20_000;
  private static readonly FLIP_HOLD_MS = 1_100;
  /** Total time the reveal stays on screen, start to collapse. */
  private static readonly COMPACT_CYCLE_VISIBLE_MS = 5_000;
  /** Scratch begins the instant the ₹999 text appears — no pause first. */
  private static readonly COMPACT_PRE_STRIKE_MS = 0;
  private static readonly COMPACT_STRIKE_DRAW_MS = 2_000;
  private static readonly COMPACT_SETTLE_HOLD_MS =
    CtaPill.COMPACT_CYCLE_VISIBLE_MS - CtaPill.COMPACT_PRE_STRIKE_MS - CtaPill.COMPACT_STRIKE_DRAW_MS;
  private flipTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    if (!this.price() || !this.originalPrice()) return;
    if (this.compact()) {
      this.metaRevealed.set(false);
      this.scheduleCompactCycle();
    } else {
      this.scheduleStandardCycle();
    }
    this.destroyRef.onDestroy(() => clearTimeout(this.flipTimer));
  }

  /** Programme/Close pills: meta is always on screen, so the cycle is just a
   *  brief, periodic flip to the struck ₹999 and back to ₹499. */
  private scheduleStandardCycle(): void {
    const delay = this.randomCycleDelay();
    this.flipTimer = setTimeout(() => {
      this.priceFlipped.set(true);
      this.strikeDrawn.set(true);
      this.flipTimer = setTimeout(() => {
        this.priceFlipped.set(false);
        this.strikeDrawn.set(false);
        this.scheduleStandardCycle();
      }, CtaPill.FLIP_HOLD_MS);
    }, delay);
  }

  /** The compact chrome pill: rests as just the label, then periodically
   *  reveals "30 min · ₹999", scratches the ₹999 off, settles on ₹499, holds
   *  a moment, and collapses back down to just the label again. */
  private scheduleCompactCycle(): void {
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
            this.scheduleCompactCycle();
          }, CtaPill.COMPACT_SETTLE_HOLD_MS);
        }, CtaPill.COMPACT_STRIKE_DRAW_MS);
      }, CtaPill.COMPACT_PRE_STRIKE_MS);
    }, delay);
  }

  private randomCycleDelay(): number {
    return CtaPill.CYCLE_MIN_INTERVAL_MS + Math.random() * (CtaPill.CYCLE_MAX_INTERVAL_MS - CtaPill.CYCLE_MIN_INTERVAL_MS);
  }
}
