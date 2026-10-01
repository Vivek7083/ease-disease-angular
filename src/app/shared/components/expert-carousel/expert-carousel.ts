import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { TeamCard, type TeamMember } from '../team-card/team-card';

/**
 * Both breakpoints auto-advance through the experts on a timer, and it never
 * stops — a manual arrow press (or swipe) just jumps the index immediately,
 * and the timer keeps ticking from wherever that lands. prefers-reduced-motion
 * skips autoplay entirely.
 *
 * Mobile: a 3D "coverflow" — the active card faces forward, the other two
 * sit rotated and scaled down on either side like a cylinder.
 *
 * Desktop: a split spotlight — one expert at a time, photo on the left,
 * everything else on the right, the whole panel re-entering with a slide/
 * fade each time the active expert changes.
 */
@Component({
  selector: 'app-expert-carousel',
  imports: [TeamCard],
  template: `
    <!-- Desktop (≥900px) -->
    <div class="experts-spotlight">
      @for (member of [members()[activeIndex()]]; track activeIndex()) {
        <app-team-card class="spotlight-card" [split]="true" [member]="member" (connectRequested)="connectRequested.emit(member)" />
      }
      <div class="spotlight-arrows">
        <button type="button" class="arrow" aria-label="Previous expert" (click)="prev()">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4l-6 6 6 6" /></svg>
        </button>
        <button type="button" class="arrow" aria-label="Next expert" (click)="next()">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4l6 6-6 6" /></svg>
        </button>
      </div>
    </div>

    <!-- Mobile/tablet (<900px) -->
    <div class="experts-carousel">
      <div class="carousel-stage" (pointerdown)="onPointerDown($event)" (pointerup)="onPointerUp($event)" (pointercancel)="onPointerCancel()">
        @for (member of members(); track member.name; let i = $index) {
          <div
            class="carousel-card"
            [style.transform]="cardTransform(i)"
            [style.opacity]="cardOpacity(i)"
            [style.z-index]="cardZ(i)"
            [style.pointer-events]="circularOffset(i) === 0 ? 'auto' : 'none'"
          >
            <app-team-card [member]="member" (connectRequested)="connectRequested.emit(member)" />
          </div>
        }
      </div>
      <div class="carousel-arrows">
        <button type="button" class="arrow" aria-label="Previous expert" (click)="prev()">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4l-6 6 6 6" /></svg>
        </button>
        <button type="button" class="arrow" aria-label="Next expert" (click)="next()">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    .experts-spotlight {
      display: none;
    }

    .experts-carousel {
      display: none;
    }

    @media (min-width: 900px) {
      .experts-spotlight {
        display: block;
      }

      .spotlight-card {
        display: block;
        animation: spotlight-enter 520ms var(--ease-out-soft);
      }

      @keyframes spotlight-enter {
        from {
          opacity: 0;
          transform: translateX(28px);
        }
      }

      .spotlight-arrows {
        margin-top: var(--sp-6);
      }
    }

    @media (min-width: 900px) and (prefers-reduced-motion: reduce) {
      .spotlight-card {
        animation: none;
      }
    }

    @media (max-width: 899px) {
      .experts-carousel {
        display: block;
      }

      .carousel-stage {
        position: relative;
        height: 480px;
        /* Bleeds past the section's own gutter to the true viewport edges —
           the rotated side cards need that extra width to peek convincingly.
           Only the stage bleeds; the arrows row below stays within the gutter. */
        margin-inline: calc(var(--gutter-mobile) * -1);
        /* A moderate perspective keeps the side cards readable instead of
           smearing into an extreme fisheye curve. */
        perspective: 1200px;
        touch-action: pan-y;
        /* The rotated/translated side cards extend past this box by design
           (that's the peek) — without clipping here, that overflow becomes
           real page-level horizontal scroll instead of a contained peek. */
        overflow: hidden;
      }

      .carousel-card {
        position: absolute;
        top: 0;
        left: 50%;
        width: min(76vw, 300px);
        transition:
          transform 480ms var(--ease-out-soft),
          opacity 480ms var(--ease-out-soft);
      }

      .carousel-arrows {
        margin-top: var(--sp-5);
      }
    }

    @media (max-width: 899px) and (prefers-reduced-motion: reduce) {
      .carousel-card {
        transition: none;
      }
    }

    /* Arrows: shared look for both breakpoints. */
    .spotlight-arrows,
    .carousel-arrows {
      display: flex;
      justify-content: center;
      gap: var(--sp-4);
    }
    .arrow {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 50%;
      border: 1.5px solid var(--rule-on-light);
      background: var(--surface-card-light);
      color: var(--oxblood);
      cursor: pointer;
      transition:
        background var(--dur-micro) var(--ease),
        border-color var(--dur-micro) var(--ease);
    }
    .arrow:hover {
      border-color: var(--oxblood);
    }
    .arrow:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    .arrow svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class ExpertCarousel {
  readonly members = input.required<readonly TeamMember[]>();
  readonly connectRequested = output<TeamMember>();

  protected readonly activeIndex = signal(0);

  private readonly destroyRef = inject(DestroyRef);
  private autoTimer: ReturnType<typeof setInterval> | undefined;
  private dragStartX: number | null = null;

  private static readonly AUTO_ADVANCE_MS = 4500;
  private static readonly SWIPE_THRESHOLD_PX = 40;
  private static readonly ROTATE_DEG = 28;
  private static readonly SPREAD_PERCENT = 68;
  private static readonly DEPTH_PX = 140;
  private static readonly SIDE_SCALE = 0.82;

  constructor() {
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      this.autoTimer = setInterval(() => this.advance(1), ExpertCarousel.AUTO_ADVANCE_MS);
      this.destroyRef.onDestroy(() => clearInterval(this.autoTimer));
    }
  }

  /** Signed distance from the active card, wrapped the short way round the
   *  cylinder (e.g. with 3 cards, index 0 is both "+1" and "-2" from index 2 —
   *  this picks -1, keeping the carousel feeling continuous either direction). */
  protected circularOffset(i: number): number {
    const n = this.members().length;
    if (n === 0) return 0;
    let raw = (i - this.activeIndex()) % n;
    if (raw > n / 2) raw -= n;
    if (raw < -n / 2) raw += n;
    return raw;
  }

  protected cardTransform(i: number): string {
    const offset = this.circularOffset(i);
    const rotate = offset * -ExpertCarousel.ROTATE_DEG;
    const translate = offset * ExpertCarousel.SPREAD_PERCENT;
    const depth = Math.abs(offset) * -ExpertCarousel.DEPTH_PX;
    const scale = offset === 0 ? 1 : ExpertCarousel.SIDE_SCALE;
    return `translateX(-50%) translateX(${translate}%) translateZ(${depth}px) rotateY(${rotate}deg) scale(${scale})`;
  }

  protected cardOpacity(i: number): number {
    const offset = Math.abs(this.circularOffset(i));
    if (offset === 0) return 1;
    if (offset === 1) return 0.55;
    return 0;
  }

  protected cardZ(i: number): number {
    return 10 - Math.abs(this.circularOffset(i));
  }

  protected prev(): void {
    this.advance(-1);
  }

  protected next(): void {
    this.advance(1);
  }

  private advance(delta: number): void {
    const n = this.members().length;
    if (n === 0) return;
    this.activeIndex.update((i) => ((i + delta) % n + n) % n);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.dragStartX = event.clientX;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.dragStartX === null) return;
    const deltaX = event.clientX - this.dragStartX;
    this.dragStartX = null;
    if (deltaX <= -ExpertCarousel.SWIPE_THRESHOLD_PX) {
      this.advance(1);
    } else if (deltaX >= ExpertCarousel.SWIPE_THRESHOLD_PX) {
      this.advance(-1);
    }
  }

  protected onPointerCancel(): void {
    this.dragStartX = null;
  }
}
