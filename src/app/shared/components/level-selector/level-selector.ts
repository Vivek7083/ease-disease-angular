import { Component, DestroyRef, ElementRef, computed, effect, inject, input, output, signal, viewChildren } from '@angular/core';
import { LevelCard, type Level } from '../level-card/level-card';

/**
 * A depth gauge, not a pinned scrollytelling drag like the Hook section's
 * slider — a small, static control the reader drags or taps directly. The
 * thumb tracks the pointer continuously (any position, not just the three
 * stops), and only snaps to the nearest stop on release — a native
 * <input type="range"> can't do that (its step snaps live, mid-drag), so
 * this is a custom pointer-driven control instead, with role="slider" for
 * the same keyboard/screen-reader behaviour a native one would give for free.
 */
@Component({
  selector: 'app-level-selector',
  imports: [LevelCard],
  template: `
    <div class="level-gauge">
      <!-- Mobile/tablet (<900px): the drag gauge. -->
      <div class="gauge-mobile">
        <div
          class="gauge-track"
          #track
          role="slider"
          tabindex="0"
          [attr.aria-valuemin]="0"
          [attr.aria-valuemax]="levels().length - 1"
          [attr.aria-valuenow]="activeIndex()"
          [attr.aria-valuetext]="levels()[activeIndex()].name"
          aria-label="Choose how deep you want to go"
          (pointerdown)="onPointerDown($event, track)"
          (pointermove)="onPointerMove($event, track)"
          (pointerup)="onPointerUp($event)"
          (pointercancel)="onPointerUp($event)"
          (keydown)="onKeydown($event)"
        >
          <div class="gauge-groove"></div>
          <div class="gauge-thumb" [class.is-dragging]="dragging()" [style.left.%]="displayPercent()"></div>
        </div>

        <!-- Ticks sit in the same 0–100% coordinate space as the thumb (absolute,
             not flex space-between) so tick 1/3 line up exactly under the thumb
             at its two end positions, not inset by half a tick's own width.
             Each one is its own button — clicking a number opens that package
             directly, same as dragging the thumb to it. -->
        <div class="gauge-ticks">
          @for (level of levels(); track level.name; let i = $index) {
            <button
              type="button"
              class="gauge-tick"
              [class.is-active]="i === activeIndex()"
              [style.left.%]="stepPercent(i)"
              [attr.aria-label]="'Show ' + level.name"
              [attr.aria-pressed]="i === activeIndex()"
              (click)="selectIndex(i)"
            >
              {{ i + 1 }}
            </button>
          }
        </div>
        <p class="gauge-active-label" aria-hidden="true">{{ levels()[activeIndex()].tag }}</p>

        <!-- Swipe left/right over the package card also moves between packages —
             a tap still reaches the card's own CTA button normally, only a real
             horizontal drag past the threshold changes the selection. -->
        <div class="gauge-panel-wrap" (pointerdown)="onPanelPointerDown($event)" (pointerup)="onPanelPointerUp($event)">
          @for (level of [levels()[activeIndex()]]; track activeIndex()) {
            <app-level-card class="gauge-panel" [level]="level" (booked)="booked.emit()" />
          }
        </div>
      </div>

      <!-- Desktop (≥900px): scrollytelling instead of drag/swipe — all three
           packages sit stacked in normal flow on the right, and scrolling past
           each one is what changes the selection (an IntersectionObserver on
           each card, not a scroll-position calculation). The node tracker on
           the left stays pinned (position: sticky) alongside them, so it reads
           as "here's where you are" rather than a control to operate. Clicking
           a node still jumps straight to that card, same as reaching it by
           scrolling. -->
      <div class="gauge-desktop">
        <div class="gauge-nodes-sticky">
          <div class="gauge-nodes" role="list" aria-label="Packages">
            @for (level of levels(); track level.name; let i = $index; let last = $last) {
              <div class="gauge-node-row" role="listitem">
                <span class="gauge-node-col">
                  <button
                    type="button"
                    class="gauge-node"
                    [class.is-filled]="i <= activeIndex()"
                    [attr.aria-pressed]="i === activeIndex()"
                    [attr.aria-label]="'Show ' + level.name"
                    (click)="selectIndex(i)"
                  >
                    {{ i + 1 }}
                  </button>
                  @if (!last) {
                    <span class="gauge-node-connector" [class.is-filled]="i < activeIndex()"></span>
                  }
                </span>
                <span class="gauge-node-label" [class.is-active]="i === activeIndex()">{{ level.tag }}</span>
              </div>
            }
          </div>
        </div>

        <div class="gauge-stack">
          @for (level of levels(); track level.name; let i = $index) {
            <div #stackCard class="gauge-stack-card" [class.is-first]="i === 0">
              <app-level-card [level]="level" (booked)="booked.emit()" />
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .level-gauge {
      margin-top: var(--sp-8);
    }

    .gauge-desktop {
      display: none;
    }

    /* Inset from the component's own edges (not padding — percentage
       positions for the absolutely-positioned thumb/ticks resolve against
       this element's own box, so padding wouldn't shrink that coordinate
       space, margin does) so the end stops clear the page's fixed scroll
       indicator on the right, and read as deliberate on the left too. */
    .gauge-track {
      position: relative;
      height: 44px;
      margin-inline: var(--sp-6);
      display: flex;
      align-items: center;
      touch-action: none;
      cursor: grab;
    }
    .gauge-track:active {
      cursor: grabbing;
    }
    .gauge-track:focus {
      outline: none;
    }

    /* The track's own hit area stays a full 44px tap target (touch target
       minimum), but focus should ring the thin visible line, not that whole
       invisible box — otherwise focus reads as a big bordered pill. Scoped to
       :focus-visible so a mouse drag/click never shows it, only keyboard. */
    .gauge-track:focus-visible .gauge-groove {
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--oxblood) 35%, transparent);
    }

    /* A simple, fully-filled oxblood line — not a progress bar, the triangle
       alone marks the current position. Not the ember CTA gradient; that
       stays reserved for actual CTAs. */
    .gauge-groove {
      width: 100%;
      height: 1px;
      background: var(--oxblood);
      transition: box-shadow var(--dur-micro) var(--ease);
    }

    /* A triangular marker instead of a round handle — points down into the
       groove like a level/depth flag. Olive against the oxblood line for the
       same two-accent pairing used elsewhere. Purely visual: the track
       element underneath handles all pointer input across its full width. */
    .gauge-thumb {
      position: absolute;
      top: 6px;
      width: 20px;
      height: 16px;
      transform: translateX(-50%);
      clip-path: polygon(50% 100%, 0 0, 100% 0);
      background: var(--olive);
      filter: drop-shadow(0 6px 10px color-mix(in oklab, var(--oxblood) 35%, transparent));
      pointer-events: none;
      transition: left 320ms var(--ease-out-soft);
    }
    .gauge-thumb.is-dragging {
      transition: none;
    }

    .gauge-ticks {
      position: relative;
      height: 26px;
      margin-top: var(--sp-5);
      margin-inline: var(--sp-6);
    }
    .gauge-tick {
      position: absolute;
      top: 0;
      transform: translateX(-50%);
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      border: none;
      border-radius: 50%;
      box-shadow: inset 0 0 0 1px var(--rule-on-light);
      background: var(--surface-card-light);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--text-quiet-light);
      cursor: pointer;
      transition:
        background var(--dur-micro) var(--ease),
        color var(--dur-micro) var(--ease);
    }
    .gauge-tick:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    .gauge-tick.is-active {
      background: var(--oxblood);
      box-shadow: var(--shadow-soft);
      color: #fff6ef;
      font-weight: 600;
    }

    .gauge-panel-wrap {
      touch-action: pan-y;
    }
    .gauge-active-label {
      margin: var(--sp-3) 0 0;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--oxblood);
    }

    .gauge-panel {
      display: block;
      margin-top: var(--sp-6);
      animation: gauge-pop 260ms var(--ease-out-soft);
    }

    @keyframes gauge-pop {
      from {
        opacity: 0;
        transform: translateY(6px) scale(0.98);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .gauge-panel {
        animation: none;
      }
      .gauge-thumb {
        transition: none;
      }
    }

    @media (min-width: 900px) {
      .gauge-mobile {
        display: none;
      }
      .gauge-desktop {
        display: grid;
        grid-template-columns: minmax(180px, 260px) minmax(0, 1fr);
        gap: var(--sp-10);
        align-items: start;
      }
    }

    .gauge-nodes-sticky {
      position: sticky;
      top: var(--sp-10);
    }
    .gauge-nodes {
      display: flex;
      flex-direction: column;
    }

    .gauge-stack {
      display: flex;
      flex-direction: column;
    }
    .gauge-stack-card {
      display: block;
      scroll-margin-top: 30vh;
    }
    /* Package 1 gets extra room below it before package 2 can take over —
       about a second longer to read at an ordinary scroll speed — since it's
       the first thing the reader meets and needs a beat to land, where 2 and
       3 are already oriented by then. */
    .gauge-stack-card.is-first {
      margin-bottom: 40vh;
    }
    .gauge-stack-card:not(.is-first) {
      margin-bottom: 16vh;
    }
    .gauge-stack-card:last-child {
      margin-bottom: 0;
    }

    .gauge-node-row {
      display: flex;
      align-items: flex-start;
      gap: var(--sp-4);
    }
    .gauge-node-col {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .gauge-node {
      flex: none;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      box-shadow: inset 0 0 0 1px var(--rule-on-light);
      background: var(--surface-card-light);
      font-family: var(--font-mono);
      font-size: 0.86rem;
      color: var(--text-quiet-light);
      cursor: pointer;
      transition:
        background var(--dur-micro) var(--ease),
        color var(--dur-micro) var(--ease);
    }
    .gauge-node:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    .gauge-node.is-filled {
      background: var(--oxblood);
      box-shadow: var(--shadow-soft);
      color: #fff6ef;
      font-weight: 600;
    }
    /* The line between two nodes — filled the same oxblood once both nodes
       it joins are filled, so clicking node 3 reads as "1 through 3", the
       whole path lighting up, not just the one node you tapped. */
    .gauge-node-connector {
      width: 1px;
      flex: 1 1 auto;
      min-height: var(--sp-8);
      margin-block: var(--sp-1);
      background: var(--rule-on-light);
      transition: background var(--dur-base) var(--ease);
    }
    .gauge-node-connector.is-filled {
      background: var(--oxblood);
    }
    .gauge-node-label {
      margin-top: 8px;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--text-quiet-light);
    }
    .gauge-node-label.is-active {
      color: var(--oxblood);
      font-weight: 600;
    }
  `,
})
export class LevelSelector {
  readonly levels = input.required<readonly Level[]>();
  readonly booked = output<void>();

  private readonly destroyRef = inject(DestroyRef);

  protected readonly activeIndex = signal(0);
  protected readonly dragging = signal(false);
  private readonly dragPercent = signal<number | null>(null);
  private panelStartX: number | null = null;

  private static readonly SWIPE_THRESHOLD_PX = 40;

  /** Desktop only: each stacked card, read as the native element so an
   *  IntersectionObserver can watch them directly (scrollytelling drives
   *  selection on desktop, not a click/drag control). */
  private readonly stackCards = viewChildren<ElementRef<HTMLElement>>('stackCard');
  private observer?: IntersectionObserver;

  constructor() {
    effect(() => {
      const cards = this.stackCards();
      this.observer?.disconnect();
      if (cards.length === 0) return;

      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const index = cards.findIndex((card) => card.nativeElement === entry.target);
            if (index >= 0) this.activeIndex.set(index);
          }
        },
        // A card "becomes current" once it crosses the vertical middle third
        // of the viewport, not merely on entering it — this is what makes
        // scrolling past the long gap under package 1 still land cleanly.
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
      );
      for (const card of cards) this.observer.observe(card.nativeElement);
    });

    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  protected readonly displayPercent = computed(() => this.dragPercent() ?? this.stepPercent(this.activeIndex()));

  protected stepPercent(index: number): number {
    const max = this.levels().length - 1;
    return max > 0 ? (index / max) * 100 : 0;
  }

  private percentFromEvent(event: PointerEvent, track: HTMLElement): number {
    const rect = track.getBoundingClientRect();
    const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    return Math.min(100, Math.max(0, ratio * 100));
  }

  private nearestIndex(percent: number): number {
    const max = this.levels().length - 1;
    return max > 0 ? Math.round((percent / 100) * max) : 0;
  }

  protected onPointerDown(event: PointerEvent, track: HTMLElement): void {
    track.setPointerCapture(event.pointerId);
    this.dragging.set(true);
    this.dragPercent.set(this.percentFromEvent(event, track));
  }

  protected onPointerMove(event: PointerEvent, track: HTMLElement): void {
    if (!this.dragging()) return;
    this.dragPercent.set(this.percentFromEvent(event, track));
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging()) return;
    const percent = this.dragPercent();
    this.dragging.set(false);
    this.dragPercent.set(null);
    if (percent !== null) {
      this.activeIndex.set(this.nearestIndex(percent));
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const max = this.levels().length - 1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => Math.min(max, i + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(max);
        break;
    }
  }

  protected selectIndex(index: number): void {
    this.activeIndex.set(index);
    this.stackCards()[index]?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  protected onPanelPointerDown(event: PointerEvent): void {
    this.panelStartX = event.clientX;
  }

  protected onPanelPointerUp(event: PointerEvent): void {
    if (this.panelStartX === null) return;
    const deltaX = event.clientX - this.panelStartX;
    this.panelStartX = null;
    const max = this.levels().length - 1;
    if (deltaX <= -LevelSelector.SWIPE_THRESHOLD_PX) {
      this.activeIndex.update((i) => Math.min(max, i + 1));
    } else if (deltaX >= LevelSelector.SWIPE_THRESHOLD_PX) {
      this.activeIndex.update((i) => Math.max(0, i - 1));
    }
  }
}
