import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
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
    <!-- Desktop (≥900px). One persistent app-team-card — its [member] input
         just changes value, so the glass shell never destroys/remounts and
         never has a "before" and "after" look to snap between; only the
         inner content (TeamCard's own [fading] input) fades. -->
    <div class="experts-spotlight">
      <app-team-card
        class="spotlight-card"
        [split]="true"
        [fading]="spotlightFading()"
        [member]="members()[spotlightIndex()]"
        (contentHidden)="onSpotlightContentHidden()"
        (connectRequested)="connectRequested.emit(members()[spotlightIndex()])"
      />
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
      }

      .spotlight-arrows {
        margin-top: var(--sp-6);
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
        /* --ease-out-soft is an expo-out curve (cubic-bezier(.16,1,.3,1)) —
           great for a card's position settling into place, but on opacity it
           front-loads almost the entire fade into the first ~30% of the
           duration and then barely moves, which reads as a sudden dim/
           brighten rather than a smooth one. Opacity gets a gentler,
           symmetric ease instead so the dimming reads as continuous. */
        transition:
          transform 480ms var(--ease-out-soft),
          opacity 480ms ease-in-out;
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

  /** Desktop spotlight only: lags activeIndex by a short cross-fade window —
   *  spotlightFading tells the single persistent app-team-card to fade its
   *  content out; TeamCard reports back via (contentHidden) once that fade
   *  actually reaches 0 (not a guessed timer, which can race the real
   *  animation and swap the member while it's still partway visible), at
   *  which point spotlightIndex swaps and fading clears so the new content
   *  fades back in on the same element. */
  protected readonly spotlightIndex = signal(0);
  protected readonly spotlightFading = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private autoTimer: ReturnType<typeof setInterval> | undefined;
  private dragStartX: number | null = null;
  private lastSpotlightSource = 0;
  private readonly reduceMotion: boolean;

  /** Each expert stays up at least this long, so the bio can be read. */
  private static readonly AUTO_ADVANCE_MS = 10_000;
  private static readonly SWIPE_THRESHOLD_PX = 40;
  private static readonly ROTATE_DEG = 28;
  private static readonly SPREAD_PERCENT = 68;
  private static readonly DEPTH_PX = 140;
  private static readonly SIDE_SCALE = 0.82;

  constructor() {
    this.reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.reduceMotion) {
      this.startAutoTimer();
      this.destroyRef.onDestroy(() => clearInterval(this.autoTimer));
    }

    effect(() => {
      const target = this.activeIndex();
      if (target === this.lastSpotlightSource) return;
      this.lastSpotlightSource = target;

      if (this.reduceMotion) {
        this.spotlightIndex.set(target);
        return;
      }

      this.spotlightFading.set(true); // fade the current content out in place; onSpotlightContentHidden takes it from here
    });
  }

  private startAutoTimer(): void {
    clearInterval(this.autoTimer);
    this.autoTimer = setInterval(() => this.advance(1), ExpertCarousel.AUTO_ADVANCE_MS);
  }

  /** A manual change restarts the countdown, so the card just chosen also gets its full time. */
  private advanceManually(delta: number): void {
    this.advance(delta);
    if (!this.reduceMotion) {
      this.startAutoTimer();
    }
  }

  protected onSpotlightContentHidden(): void {
    if (!this.spotlightFading()) return;
    this.spotlightIndex.set(this.activeIndex()); // swap member while content is invisible
    this.spotlightFading.set(false); // fade the new content back in, same element
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
    this.advanceManually(-1);
  }

  protected next(): void {
    this.advanceManually(1);
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
      this.advanceManually(1);
    } else if (deltaX >= ExpertCarousel.SWIPE_THRESHOLD_PX) {
      this.advanceManually(-1);
    }
  }

  protected onPointerCancel(): void {
    this.dragStartX = null;
  }
}
