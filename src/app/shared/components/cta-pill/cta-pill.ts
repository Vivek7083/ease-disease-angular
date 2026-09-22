import { Component, input, output } from '@angular/core';

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
      [class.reveal-on-hover]="revealMetaOnHover()"
      (click)="pressed.emit()"
    >
      <span class="label">{{ label() }}</span>
      @if (meta(); as m) {
        <span class="meta">{{ m }}</span>
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
      padding: 0 var(--sp-5);
      font-size: 0.94rem;
    }
    .cta:hover {
      transform: translateY(-1px);
    }
    .cta:active {
      transform: scale(0.98);
    }
    .meta {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      padding-left: var(--sp-3);
      border-left: 1px solid currentColor;
      opacity: 0.85;
    }
    /* Compact chrome contexts: keep the price/time hidden until the reader
       actually hovers or focuses the button, then reveal it — a small
       "there's more here" moment instead of showing it inline all the time. */
    .cta.reveal-on-hover .meta {
      display: inline-block;
      max-width: 0;
      padding-left: 0;
      border-left-width: 0;
      opacity: 0;
      overflow: hidden;
      white-space: nowrap;
      transition:
        max-width var(--dur-base) var(--ease),
        padding-left var(--dur-base) var(--ease),
        opacity var(--dur-micro) linear;
    }
    .cta.reveal-on-hover:hover .meta,
    .cta.reveal-on-hover:focus-visible .meta {
      max-width: 140px;
      padding-left: var(--sp-3);
      border-left-width: 1px;
      opacity: 0.85;
    }
    @media (hover: none) {
      /* Touch devices have no hover, so the reveal happens on press instead
         — hold the button down (a long-press reads clearest) and the
         price/time appears for as long as the finger stays down. */
      .cta.reveal-on-hover:active .meta {
        max-width: 140px;
        padding-left: var(--sp-3);
        border-left-width: 1px;
        opacity: 0.85;
      }
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
      }
    }
  `,
})
export class CtaPill {
  readonly label = input('Book a consultation');
  readonly meta = input<string | undefined>(undefined);
  readonly variant = input<CtaVariant>('primary');
  readonly compact = input(false);
  readonly floating = input(false);
  readonly revealMetaOnHover = input(false);
  readonly pressed = output<void>();
}
