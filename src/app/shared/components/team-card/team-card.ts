import { NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { CtaPill } from '../cta-pill/cta-pill';

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly credential: string;
  readonly bio: string;
  readonly initials: string;
  readonly ctaLabel: string;
  /** Left unset until a real photo is supplied — the portrait falls back to the initials badge. */
  readonly photo?: string;
}

@Component({
  selector: 'app-team-card',
  imports: [NgOptimizedImage, CtaPill],
  template: `
    <article class="team-card" [class.is-split]="split()">
      <svg class="foliage foliage-a" viewBox="0 0 160 160" aria-hidden="true">
        <path d="M6 154C40 120 34 80 66 50C84 33 100 26 124 12" />
        <path d="M66 50C53 46 44 33 48 18" />
        <path d="M66 50C80 54 89 44 86 30" />
        <path d="M100 30C90 26 83 15 87 3" />
        <path d="M100 30C110 33 117 24 114 12" />
      </svg>
      <svg class="foliage foliage-b" viewBox="0 0 160 160" aria-hidden="true">
        <path d="M154 150C130 128 132 100 108 78C96 67 85 62 68 54" />
        <path d="M108 78C117 75 123 65 118 54" />
        <path d="M108 78C98 82 90 75 92 63" />
      </svg>
      <span class="card-energy" aria-hidden="true"></span>
      <div class="content" [style.opacity]="contentOpacity()">
        <div class="portrait">
          @if (member().photo; as photo) {
            <img [ngSrc]="photo" fill alt="" />
          } @else {
            <span class="portrait-fallback" aria-hidden="true">{{ member().initials }}</span>
          }
        </div>
        <div class="info">
          <h3>{{ member().name }}</h3>
          <p class="role">{{ member().role }}</p>
          <p class="credential">{{ member().credential }}</p>
          <p class="bio">{{ member().bio }}</p>
          <app-cta-pill class="cta" [label]="member().ctaLabel" variant="ghostDark" (pressed)="connectRequested.emit()" />
        </div>
      </div>
    </article>
  `,
  styles: `
    /* Hospitality look: a warm champagne-to-parchment card with a honey-gold
       hairline and a fine inner frame, like a welcome card at a good hotel
       or spa — warm and inviting rather than clinical. Solid (no blur), so
       the colour never shifts with whatever scrolls behind it. */
    .team-card {
      position: relative;
      overflow: hidden;
      background: linear-gradient(
        158deg,
        color-mix(in oklab, var(--honey) 18%, var(--ivory)) 0%,
        color-mix(in oklab, var(--honey) 8%, var(--parchment)) 100%
      );
      color: var(--ink);
      border-radius: var(--r-lg);
      padding: var(--sp-8) var(--sp-6) var(--sp-6);
      border: 1px solid color-mix(in oklab, var(--honey) 60%, var(--parchment));
      outline: 1px solid color-mix(in oklab, var(--honey) 45%, transparent);
      outline-offset: -9px;
      box-shadow:
        var(--shadow-lift),
        inset 0 1px 0 color-mix(in oklab, white 75%, transparent);
    }

    /* Content fades independently of the card shell above — the shell
       (background, border, foliage, energy dot) never remounts or
       re-renders when the active expert changes, so its color never has a
       "before" and "after" state to snap between. Only this inner layer
       swaps, and its opacity is driven frame-by-frame from the component
       (see contentOpacity) rather than a CSS class+transition: a transition
       toggled via class on an element inside a backdrop-filter ancestor
       measurably stalls for ~200ms before it starts animating in this
       browser, then has to cram the rest into whatever time is left —
       reading as a stall-then-snap instead of a smooth fade. Driving the
       numeric value directly sidesteps that engage delay entirely. */
    .content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    /* Sprouting branches in the corners — decorative only, well behind the
       text (negative z-index beats the card's own in-flow content, which
       otherwise stacks above a merely-absolute, non-negative descendant). */
    .foliage {
      position: absolute;
      z-index: -1;
      width: 130px;
      height: 130px;
      fill: none;
      stroke: var(--olive);
      stroke-width: 2.5;
      stroke-linecap: round;
      opacity: 0.4;
    }
    .foliage-a {
      bottom: -18px;
      left: -18px;
    }
    .foliage-b {
      top: -18px;
      right: -18px;
      transform: rotate(180deg);
    }

    /* The same travelling-energy idea as the page's own background flow
       line (flow-lines.ts), scaled down to hug this one card's border
       instead of a page-length path — offset-path: border-box traces the
       card's actual box (radius included) with no hand-built SVG path
       needed. Kept very subtle: small, low-opacity, soft glow only. */
    .card-energy {
      position: absolute;
      inset: 0;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--terracotta);
      offset-path: border-box;
      offset-rotate: 0deg;
      opacity: 0.4;
      filter: drop-shadow(0 0 3px color-mix(in oklab, var(--terracotta) 55%, transparent));
      animation: card-energy-travel 9s linear infinite;
    }
    @keyframes card-energy-travel {
      to {
        offset-distance: 100%;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .card-energy {
        animation: none;
        opacity: 0;
      }
    }

    .portrait {
      position: relative;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--gradient-ember);
    }

    .portrait img {
      object-fit: cover;
    }

    .portrait-fallback {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff6ef;
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 600;
    }

    .info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    h3 {
      margin-top: var(--sp-5);
      font-size: var(--fs-display-s);
      color: var(--ink);
    }

    .role {
      margin-top: var(--sp-1);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--olive);
    }

    .credential {
      margin-top: var(--sp-2);
      font-size: 0.82rem;
      color: var(--text-quiet-light);
    }

    .bio {
      margin-top: var(--sp-4);
      color: var(--text-quiet-light);
      font-size: 0.9rem;
      line-height: var(--lh-body);
      max-width: 32ch;
    }

    .cta {
      margin-top: var(--sp-6);
    }

    /* Split layout: photo and info sit side by side instead of stacked —
       used for the large-screen spotlight, where there's width to spare and
       centering everything would waste it. */
    .team-card.is-split {
      padding: var(--sp-10);
    }
    .team-card.is-split .content {
      flex-direction: row;
      align-items: center;
      text-align: left;
      gap: var(--sp-10);
    }
    .team-card.is-split .portrait {
      flex: none;
      width: 220px;
      height: 220px;
    }
    .team-card.is-split .portrait-fallback {
      font-size: 3.2rem;
    }
    .team-card.is-split .info {
      align-items: flex-start;
      flex: 1;
    }
    .team-card.is-split h3 {
      margin-top: 0;
      font-size: var(--fs-display-m);
    }
    .team-card.is-split .bio {
      max-width: 48ch;
    }
  `,
})
export class TeamCard {
  readonly member = input.required<TeamMember>();
  readonly split = input(false);
  /** Desktop spotlight only — fades the inner content out and back in while
   *  the glass shell itself stays mounted and unchanged. */
  readonly fading = input(false);
  readonly connectRequested = output<void>();
  /** Fires once the fade-out tween actually reaches 0 — the caller swaps
   *  member data on this, not on a guessed timer, so the swap never happens
   *  while the old content is still partway visible. */
  readonly contentHidden = output<void>();

  protected readonly contentOpacity = signal(1);

  private readonly destroyRef = inject(DestroyRef);
  private readonly reduceMotion: boolean;
  private rafId: number | undefined;

  private static readonly FADE_MS = 260;

  constructor() {
    this.reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    effect(() => {
      const target = this.fading() ? 0 : 1;
      // animateOpacityTo reads/writes contentOpacity() internally (to find
      // the tween's starting value and to step it every frame) — without
      // untracked, those reads register as extra dependencies of THIS
      // effect, so every single .set() during the tween re-triggers the
      // whole effect and restarts the tween from wherever it just got to.
      // The result is a self-sustaining loop that keeps approaching the
      // target in ever-smaller steps instead of ever actually reaching it.
      untracked(() => this.animateOpacityTo(target));
    });
    this.destroyRef.onDestroy(() => {
      if (this.rafId !== undefined) {
        cancelAnimationFrame(this.rafId);
      }
    });
  }

  private animateOpacityTo(target: number): void {
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    if (this.reduceMotion || this.contentOpacity() === target) {
      this.contentOpacity.set(target);
      if (target === 0) {
        this.contentHidden.emit();
      }
      return;
    }

    const start = this.contentOpacity();
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / TeamCard.FADE_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // ease-in-out
      this.contentOpacity.set(start + (target - start) * eased);
      if (t < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = undefined;
        if (target === 0) {
          this.contentHidden.emit();
        }
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }
}
