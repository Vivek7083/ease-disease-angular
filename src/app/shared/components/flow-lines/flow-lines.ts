import { Component, DestroyRef, inject, signal } from '@angular/core';

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 1200;
const STEPS = 6;

/**
 * Deterministic pseudo-random (fixed seed) so server and client render the
 * same markup — irregular enough to read as an organic drift rather than an
 * obviously mechanical curve, but stable across renders/hydration.
 */
function makeRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** One gently wandering line down the middle of the viewport, top to bottom. */
function buildPath(): string {
  const rand = makeRandom(7);
  const baseX = VIEW_WIDTH / 2;
  let x = baseX + (rand() - 0.5) * 60;
  let d = `M${x.toFixed(1)},-60`;

  for (let s = 1; s <= STEPS; s++) {
    const y = (s / STEPS) * (VIEW_HEIGHT + 120) - 60;
    const midY = y - (VIEW_HEIGHT / STEPS) / 2;
    const nextX = baseX + (rand() - 0.5) * 180;
    const controlX = (x + nextX) / 2 + (rand() - 0.5) * 120;
    d += ` Q${controlX.toFixed(1)},${midY.toFixed(1)} ${nextX.toFixed(1)},${y.toFixed(1)}`;
    x = nextX;
  }

  return d;
}

/**
 * A single, quiet line drifting top to bottom behind the page content — just
 * enough of the gut-hub's own thread language to keep the gaps between
 * sections from reading as empty canvas, without turning into a design
 * element of its own. Fixed to the viewport (like app.scss's
 * canvas-root/ambient-field), not tied to scroll position.
 */
@Component({
  selector: 'app-flow-lines',
  template: `
    <svg class="flow-lines" [attr.viewBox]="'0 0 ' + viewWidth + ' ' + viewHeight" preserveAspectRatio="none" aria-hidden="true">
      <path class="flow-thread" [attr.d]="path" />
      @if (!reducedMotion()) {
        <circle class="flow-energy" r="3.4" [style.offset-path]="offsetPath" />
      }
    </svg>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
    }
    .flow-lines {
      display: block;
      width: 100%;
      height: 100%;
    }
    .flow-thread {
      fill: none;
      stroke: var(--oxblood);
      stroke-linecap: round;
      stroke-width: 1.2;
      stroke-dasharray: 3 20;
      opacity: 0.1;
      animation: flow-thread-move 26s linear infinite;
    }
    @keyframes flow-thread-move {
      to {
        stroke-dashoffset: -460;
      }
    }
    .flow-energy {
      fill: var(--terracotta);
      opacity: 0;
      offset-rotate: 0deg;
      animation: flow-energy-travel 16s linear infinite;
      filter: drop-shadow(0 0 3px color-mix(in oklab, var(--terracotta) 60%, transparent));
    }
    @keyframes flow-energy-travel {
      0% {
        offset-distance: 0%;
        opacity: 0;
      }
      12% {
        opacity: 0.4;
      }
      88% {
        opacity: 0.4;
      }
      100% {
        offset-distance: 100%;
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .flow-thread {
        animation: none;
      }
    }
  `,
})
export class FlowLines {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly viewWidth = VIEW_WIDTH;
  protected readonly viewHeight = VIEW_HEIGHT;
  protected readonly path = buildPath();
  protected readonly offsetPath = `path('${this.path}')`;
  protected readonly reducedMotion = signal(this.readReducedMotion());

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => this.reducedMotion.set(motionQuery.matches);
    motionQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => motionQuery.removeEventListener('change', onChange));
  }

  private readReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
