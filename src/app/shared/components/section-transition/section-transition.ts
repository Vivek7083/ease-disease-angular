import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

/**
 * Ready-made hand-offs for the seam between two sections. Drop one between
 * any pair and pick a look with `variant`; they all play when the seam
 * scrolls into view (and replay on the way back), so the next section
 * feels like it is on its way before it arrives.
 *
 *  - sprout   a stem grows and two leaves unfurl, a bud pops at the tip
 *  - vine     a vine draws across the page, leaves budding along it
 *  - wave     soft tinted ripples rise up from below
 *  - dots     a row of dots lights up in a quick left-to-right sweep
 *  - curtain  a hairline opens from the centre, a honey diamond lands
 *
 * Purely decorative (aria-hidden). The seam is only 56px tall and pulls
 * itself 20px into the padding of the sections either side, so it adds
 * almost nothing to the gap between them. With reduced motion the finished
 * state is shown straight away.
 */
export type SectionTransitionVariant = 'sprout' | 'vine' | 'wave' | 'dots' | 'curtain';

@Component({
  selector: 'app-section-transition',
  template: `
    @switch (variant()) {
      @case ('sprout') {
        <svg class="v v-sprout" viewBox="0 0 120 56" aria-hidden="true">
          <path class="stem" pathLength="1" d="M60 0 V42" />
          <path class="leaf leaf-l" d="M60 32C48 30 38 22 33 10C46 10 57 19 60 32Z" />
          <path class="leaf leaf-r" d="M60 32C72 30 82 22 87 10C74 10 63 19 60 32Z" />
          <circle class="bud" cx="60" cy="47" r="3.4" />
        </svg>
      }
      @case ('vine') {
        <svg class="v v-vine" viewBox="0 0 640 56" aria-hidden="true">
          <path class="stem" pathLength="1" d="M0 30C80 8 160 52 240 30S400 8 480 30S580 50 640 28" />
          <g transform="translate(96 24) rotate(-28)"><path class="leaf" style="--d: 500ms" d="M0 0C4-10 15-13 24-8C19 2 8 6 0 0Z" /></g>
          <g transform="translate(206 38) rotate(150)"><path class="leaf" style="--d: 640ms" d="M0 0C4-10 15-13 24-8C19 2 8 6 0 0Z" /></g>
          <g transform="translate(318 22) rotate(-34)"><path class="leaf" style="--d: 780ms" d="M0 0C4-10 15-13 24-8C19 2 8 6 0 0Z" /></g>
          <g transform="translate(430 34) rotate(158)"><path class="leaf" style="--d: 920ms" d="M0 0C4-10 15-13 24-8C19 2 8 6 0 0Z" /></g>
          <g transform="translate(540 38) rotate(-26)"><path class="leaf" style="--d: 1060ms" d="M0 0C4-10 15-13 24-8C19 2 8 6 0 0Z" /></g>
        </svg>
      }
      @case ('wave') {
        <svg class="v v-wave" viewBox="0 0 1200 56" preserveAspectRatio="none" aria-hidden="true">
          <path class="w w1" d="M0 26C150 4 300 50 450 26S750 4 900 26S1100 46 1200 24V56H0Z" />
          <path class="w w2" d="M0 34C170 54 330 14 520 34S840 54 1010 32S1140 20 1200 34V56H0Z" />
        </svg>
      }
      @case ('dots') {
        <div class="v v-dots" aria-hidden="true">
          @for (i of dots; track i) {
            <span class="dot" [class.dot-mid]="i === 3" [style.--i]="i" [style.--n]="i > 3 ? i - 3 : 3 - i"></span>
          }
        </div>
      }
      @case ('curtain') {
        <div class="v v-curtain" aria-hidden="true">
          <span class="line"></span>
          <span class="gem"></span>
        </div>
      }
    }
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 2;
      height: 56px;
      /* Pulled into the neighbouring sections' padding so the seam adds
         almost nothing to the gap between them. */
      margin-block: calc(var(--sp-5) * -1);
      pointer-events: none;
      overflow: hidden;
    }

    .v {
      display: block;
      margin-inline: auto;
      height: 100%;
    }

    /* ---------- sprout ---------- */
    .v-sprout {
      width: 120px;
      overflow: visible;
    }
    .v-sprout .stem,
    .v-vine .stem {
      fill: none;
      stroke: var(--oxblood);
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      transition: stroke-dashoffset 800ms var(--ease-out-soft);
    }
    :host(.is-active) .stem {
      stroke-dashoffset: 0;
    }
    .leaf {
      fill: var(--olive);
      transform: scale(0);
      transform-box: fill-box;
      transition: transform 650ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .leaf-l {
      transform-origin: 100% 100%;
    }
    .leaf-r {
      transform-origin: 0% 100%;
    }
    .v-sprout .leaf-l {
      transition-delay: 450ms;
    }
    .v-sprout .leaf-r {
      transition-delay: 600ms;
    }
    :host(.is-active) .leaf {
      transform: scale(1);
    }
    .bud {
      fill: var(--honey);
      transform: scale(0);
      transform-box: fill-box;
      transform-origin: center;
      transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 850ms;
    }
    :host(.is-active) .bud {
      transform: scale(1);
    }

    /* ---------- vine ---------- */
    .v-vine {
      width: min(100%, 560px);
    }
    .v-vine .stem {
      stroke-width: 1.8;
      transition-duration: 1400ms;
    }
    .v-vine .leaf {
      transform-origin: 0% 100%;
      transition-delay: var(--d, 600ms);
    }

    /* ---------- wave ---------- */
    .v-wave {
      width: 100%;
    }
    .w {
      transform: translateY(70%);
      opacity: 0;
      transition:
        transform 1000ms var(--ease-out-soft),
        opacity 700ms ease-out;
    }
    .w1 {
      fill: color-mix(in oklab, var(--olive) 11%, transparent);
    }
    .w2 {
      fill: color-mix(in oklab, var(--oxblood) 8%, transparent);
      transition-delay: 160ms;
    }
    :host(.is-active) .w {
      transform: none;
      opacity: 1;
    }

    /* ---------- dots ---------- */
    .v-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .dot {
      width: calc(12px - var(--n) * 2.5px);
      height: calc(12px - var(--n) * 2.5px);
      border-radius: 50%;
      background: var(--oxblood);
      opacity: 0;
      transform: scale(0.4);
    }
    .dot-mid {
      background: var(--honey);
    }
    :host(.is-active) .dot {
      animation: st-dot 900ms var(--ease-out-soft) calc(var(--i) * 90ms) both;
    }
    @keyframes st-dot {
      0% {
        opacity: 0;
        transform: scale(0.4);
      }
      50% {
        opacity: 1;
        transform: scale(1.6);
        background: var(--honey);
      }
      100% {
        opacity: calc(1 - var(--n) * 0.18);
        transform: scale(1);
      }
    }

    /* ---------- curtain ---------- */
    .v-curtain {
      position: relative;
      display: grid;
      place-items: center;
      width: min(86%, 560px);
    }
    .line {
      grid-area: 1 / 1;
      width: 100%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in oklab, var(--oxblood) 55%, transparent) 30%,
        color-mix(in oklab, var(--oxblood) 55%, transparent) 70%,
        transparent
      );
      transform: scaleX(0);
      transition: transform 1000ms var(--ease-out-soft);
    }
    .gem {
      grid-area: 1 / 1;
      width: 11px;
      height: 11px;
      background: var(--honey);
      box-shadow: 0 0 0 1.5px var(--oxblood);
      transform: scale(0) rotate(0deg);
      transition: transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1) 450ms;
    }
    :host(.is-active) .line {
      transform: scaleX(1);
    }
    :host(.is-active) .gem {
      transform: scale(1) rotate(45deg);
    }

    @media (prefers-reduced-motion: reduce) {
      .stem,
      .leaf,
      .bud,
      .w,
      .line,
      .gem {
        transition: none;
      }
      :host(.is-active) .dot {
        animation-duration: 0.01ms;
        animation-delay: 0s;
      }
    }
  `,
  host: {
    'aria-hidden': 'true',
    '[class.is-active]': 'active()',
  },
})
export class SectionTransition {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly variant = input<SectionTransitionVariant>('sprout');

  protected readonly active = signal(false);
  protected readonly dots = [0, 1, 2, 3, 4, 5, 6] as const;

  constructor() {
    // Browser-only (the page is prerendered): play while the seam is on screen, rewind when it leaves.
    afterNextRender(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || typeof IntersectionObserver === 'undefined') {
        this.active.set(true);
        return;
      }
      const observer = new IntersectionObserver(([entry]) => this.active.set(entry.isIntersecting), {
        threshold: 0.6,
        rootMargin: '0px 0px -12% 0px',
      });
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
