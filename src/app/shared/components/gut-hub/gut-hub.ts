import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';

interface HubNodeSpec {
  readonly key: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

// Wide layout (two-column hero) — viewBox 400x448, source at 200,224.
// Rotated 30° off the vertical/horizontal axes so no node sits directly
// above or below the coil — otherwise the food particle reads as coming
// from whichever node happens to be at 12 o'clock.
const TALL: readonly HubNodeSpec[] = [
  { key: 'skin', label: 'Skin', x: 272, y: 99 },
  { key: 'sleep', label: 'Sleep', x: 343, y: 221 },
  { key: 'energy', label: 'Energy', x: 268, y: 351 },
  { key: 'mood', label: 'Mood', x: 126, y: 352 },
  { key: 'hormones', label: 'Hormones', x: 56, y: 229 },
  { key: 'immunity', label: 'Immunity', x: 131, y: 99 },
];

// Stacked layout (mobile) — viewBox 400x352, source at 200,176. Same 30° rotation.
const SHORT: readonly HubNodeSpec[] = [
  { key: 'skin', label: 'Skin', x: 260, y: 72 },
  { key: 'sleep', label: 'Sleep', x: 330, y: 184 },
  { key: 'energy', label: 'Energy', x: 272, y: 284 },
  { key: 'mood', label: 'Mood', x: 140, y: 280 },
  { key: 'hormones', label: 'Hormones', x: 71, y: 168 },
  { key: 'immunity', label: 'Immunity', x: 129, y: 68 },
];

// The gut: five folded horizontal passes joined by wide, fully-rounded
// "stadium" turns (a real arc at each bend, not a sharp corner) plus an
// entry/exit stub and the small cecum bump. Drawn directly in final pixel
// units (no extra scaling) so the 9px tube / 3px gap / 12px row spacing are
// exact, and widened so it reads as a squat coil, not a thin tall stick.
const GUT_PATH =
  'M6,-40 L6,-24 L-14,-24 ' +
  'A6,6 0 1 0 -14,-12 L22,-12 ' +
  'A6,6 0 1 1 22,0 L-18,0 ' +
  'A6,6 0 1 0 -18,12 L18,12 ' +
  'A6,6 0 1 1 18,24 L-6,24 L-6,40';
const GUT_CREASES: readonly string[] = [
  'M2,-24 L-10,-24',
  'M-10,-12 L18,-12',
  'M18,0 L-14,0',
  'M-14,12 L14,12',
  'M14,24 L-2,24',
];
const GUT_BUMP = { x: 28, y: -6, r: 4 };
const GUT_SCALE = 1;
const LABEL_GAP = 22;

@Component({
  selector: 'app-gut-hub',
  template: `
    <div
      class="stage"
      role="img"
      aria-label="Illustration of the gut at the centre, connected by flowing lines to Skin, Sleep, Energy, Mood, Hormones and Immunity, with food moving through digestion"
      (pointerdown)="dismissHint()"
    >
      <div class="stage-glow" aria-hidden="true"></div>
      <svg [attr.viewBox]="'0 0 400 ' + viewHeight()" class="hub" aria-hidden="true">
        @for (node of nodes(); track node.key; let i = $index) {
          <path class="thread-base" [class.pending]="i >= visibleCount()" [attr.d]="pathFor(node)" />
          <path
            class="thread-flow"
            [class.pending]="i >= visibleCount()"
            [attr.d]="pathFor(node)"
            [style.opacity]="i >= visibleCount() ? 0 : effectiveHighlight() === i ? 1 : 0.42"
            [style.stroke-width]="effectiveHighlight() === i ? 2.6 : 1.2"
            [style.animation-duration]="effectiveHighlight() === i ? '0.85s' : '2.8s'"
          />
        }

        <g class="gut" [attr.transform]="coilTransform()">
          <path class="gut-tube" [attr.d]="gutPath" />
          <circle class="gut-bump" [attr.cx]="gutBump.x" [attr.cy]="gutBump.y" [attr.r]="gutBump.r" />
          @for (crease of gutCreases; track crease) {
            <path class="gut-crease" [attr.d]="crease" />
          }
          @if (!reducedMotion()) {
            <circle class="food-cell food-cell--a" r="3.6" [style.offset-path]="gutOffsetPath" />
            <circle class="food-cell food-cell--b" r="2.7" [style.offset-path]="gutOffsetPath" />
          }
        </g>

        @for (node of nodes(); track node.key; let i = $index) {
          <g
            class="node"
            [class.hovered]="effectiveHighlight() === i"
            [class.pending]="i >= visibleCount()"
            [style.transform-origin]="node.x + 'px ' + node.y + 'px'"
            (mouseenter)="hovered.set(i); dismissHint()"
            (mouseleave)="hovered.set(null)"
            (focus)="hovered.set(i); dismissHint()"
            (blur)="hovered.set(null)"
            (click)="dismissHint()"
            [attr.tabindex]="i < visibleCount() ? 0 : -1"
            [attr.aria-label]="node.label"
          >
            <circle class="node-glow" [attr.cx]="node.x" [attr.cy]="node.y" r="19" />
            <circle class="node-ring" [attr.cx]="node.x" [attr.cy]="node.y" r="11" />
            <circle class="node-dot" [attr.cx]="node.x" [attr.cy]="node.y" r="3.2" />
          </g>
        }

        @for (node of nodes(); track node.key; let i = $index) {
          <text class="node-label" [class.pending]="i >= visibleCount()" [attr.x]="labelX(node)" [attr.y]="labelY(node)" [attr.text-anchor]="labelAnchor(node)">
            {{ node.label }}
          </text>
        }

        <!-- A one-time simulated click on the top node — a small cursor that
             approaches, presses down (a ripple confirms the "click") and
             fades — the only hint that the nodes are interactive at all.
             Dismisses itself once its animation finishes, or the instant the
             reader actually touches/hovers/clicks anything in the hub. -->
        @if (showClickHint() && !reducedMotion()) {
          <g class="click-hint" [attr.transform]="'translate(' + topNode().x + ',' + topNode().y + ')'" aria-hidden="true">
            <circle class="click-hint-ripple" r="6" />
            <circle class="click-hint-dot" r="5" (animationend)="dismissHint()" />
          </g>
        }
      </svg>
    </div>
  `,
  styles: `
    .stage {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 0.9;
    }
    .stage-glow {
      position: absolute;
      inset: -12%;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in oklab, var(--terracotta) 26%, transparent) 0%, transparent 68%);
      filter: blur(24px);
      z-index: 0;
      pointer-events: none;
    }
    .hub {
      position: relative;
      z-index: 1;
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      animation: hub-in var(--dur-scene) var(--ease-out-soft) both;
    }
    @keyframes hub-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .thread-base {
      fill: none;
      stroke: color-mix(in oklab, var(--terracotta) 16%, transparent);
      stroke-width: 1.3;
    }
    .thread-flow {
      fill: none;
      stroke: var(--terracotta);
      stroke-linecap: round;
      stroke-dasharray: 2 10;
      animation-name: flow-move;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      transition:
        opacity var(--dur-base) var(--ease),
        stroke-width var(--dur-base) var(--ease);
    }
    @keyframes flow-move {
      to {
        stroke-dashoffset: -120;
      }
    }
    .gut-tube {
      fill: none;
      stroke: var(--oxblood-deep);
      stroke-width: 9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .gut-bump {
      fill: none;
      stroke: var(--oxblood-deep);
      stroke-width: 4;
    }
    .gut-crease {
      fill: none;
      stroke: color-mix(in oklab, var(--ivory) 60%, transparent);
      stroke-width: 3;
      stroke-linecap: round;
      opacity: 0.65;
    }
    .food-cell {
      fill: var(--honey);
      offset-rotate: 0deg;
    }
    .food-cell--a {
      animation: food-travel 6s linear infinite;
    }
    .food-cell--b {
      animation: food-travel 6s linear infinite;
      animation-delay: 3s;
      opacity: 0.75;
    }
    @keyframes food-travel {
      0% {
        offset-distance: 0%;
        opacity: 0;
      }
      8% {
        opacity: 1;
      }
      92% {
        opacity: 1;
      }
      100% {
        offset-distance: 100%;
        opacity: 0;
      }
    }
    .node {
      cursor: pointer;
      transition: transform var(--dur-base) var(--ease);
      outline: none;
    }
    .node.hovered,
    .node:focus-visible {
      transform: scale(1.14);
    }
    .node-glow {
      fill: var(--terracotta);
      opacity: 0.1;
      transition: opacity var(--dur-base) var(--ease);
    }
    .node.hovered .node-glow,
    .node:focus-visible .node-glow {
      opacity: 0.22;
    }
    .node-ring {
      fill: color-mix(in oklab, var(--ivory) 92%, transparent);
      stroke: var(--oxblood);
      stroke-width: 1.2;
      stroke-opacity: 0.4;
      transition: stroke-opacity var(--dur-base) var(--ease);
    }
    .node.hovered .node-ring,
    .node:focus-visible .node-ring {
      stroke-opacity: 0.75;
    }
    .node-dot {
      fill: var(--terracotta);
    }
    .node-label {
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 500;
      fill: var(--ink);
      pointer-events: none;
      transition: opacity var(--dur-base) var(--ease);
    }

    /* Progressive reveal (descentActiveIndex/revealCount) — a node not yet
       "unlocked" sits invisible and slightly shrunk rather than being
       removed from the DOM outright, so it can grow into place with a
       transition once its turn comes instead of popping in instantly. */
    .thread-base.pending,
    .thread-flow.pending,
    .node.pending,
    .node-label.pending {
      opacity: 0;
    }
    .thread-base.pending,
    .thread-flow.pending {
      transition: opacity var(--dur-base) var(--ease);
    }
    .node.pending {
      transform: scale(0.5);
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .hub {
        animation: none;
        opacity: 1;
      }
      .thread-flow {
        animation: none;
      }
    }

    /* One-shot simulated click on the top node — approaches from above,
       presses down, releases with a ripple, then fades for good. */
    .click-hint {
      pointer-events: none;
    }
    .click-hint-dot {
      fill: var(--ink);
      transform-box: fill-box;
      transform-origin: center;
      animation: click-hint-approach 2.6s var(--ease-out-soft) both;
    }
    .click-hint-ripple {
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.4;
      transform-box: fill-box;
      transform-origin: center;
      animation: click-hint-ripple 2.6s var(--ease-out-soft) both;
    }
    @keyframes click-hint-approach {
      0% {
        transform: translateY(-34px) scale(1);
        opacity: 0;
      }
      22% {
        opacity: 0.85;
      }
      45% {
        transform: translateY(-34px) scale(1);
        opacity: 0.85;
      }
      62% {
        transform: translateY(0) scale(1);
        opacity: 0.85;
      }
      72% {
        transform: translateY(0) scale(0.6);
        opacity: 0.85;
      }
      84% {
        transform: translateY(0) scale(1);
        opacity: 0.85;
      }
      100% {
        transform: translateY(0) scale(1);
        opacity: 0;
      }
    }
    @keyframes click-hint-ripple {
      0%,
      58% {
        transform: scale(0.5);
        opacity: 0;
      }
      68% {
        opacity: 0.55;
      }
      100% {
        transform: scale(3.2);
        opacity: 0;
      }
    }
  `,
})
export class GutHub {
  private readonly destroyRef = inject(DestroyRef);

  readonly activeIndex = input<number | null>(null);
  /** How many nodes (in declaration order) are "unlocked" so far — null shows all of them, as in the hero. */
  readonly revealCount = input<number | null>(null);

  readonly hovered = signal<number | null>(null);
  private readonly isMobile = signal(this.readMobile());
  readonly reducedMotion = signal(this.readReducedMotion());

  /** Real hover/focus wins over an externally-driven active index. */
  readonly effectiveHighlight = computed(() => this.hovered() ?? this.activeIndex());
  protected readonly visibleCount = computed(() => this.revealCount() ?? this.nodes().length);

  protected readonly showClickHint = signal(true);

  readonly nodes = computed<readonly HubNodeSpec[]>(() => (this.isMobile() ? SHORT : TALL));
  readonly viewHeight = computed(() => (this.isMobile() ? 352 : 448));
  readonly cx = computed(() => 200);
  readonly cy = computed(() => (this.isMobile() ? 176 : 224));

  readonly gutPath = GUT_PATH;
  readonly gutOffsetPath = `path('${GUT_PATH}')`;
  readonly gutBump = GUT_BUMP;
  readonly gutCreases = GUT_CREASES;

  readonly coilTransform = computed(() => `translate(${this.cx()} ${this.cy()}) scale(${GUT_SCALE})`);

  /** Whichever node sits highest (smallest y) — the target for the click-simulation hint. */
  protected readonly topNodeIndex = computed(() => {
    const list = this.nodes();
    let best = 0;
    for (let i = 1; i < list.length; i++) {
      if (list[i].y < list[best].y) {
        best = i;
      }
    }
    return best;
  });
  protected readonly topNode = computed(() => this.nodes()[this.topNodeIndex()]);

  protected dismissHint(): void {
    this.showClickHint.set(false);
  }

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const onResize = () => this.isMobile.set(this.readMobile());
    window.addEventListener('resize', onResize, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => this.reducedMotion.set(motionQuery.matches);
    motionQuery.addEventListener('change', onMotionChange);
    this.destroyRef.onDestroy(() => motionQuery.removeEventListener('change', onMotionChange));

    // Fallback in case `animationend` never fires (element removed from the
    // DOM mid-animation, browser quirks, etc.) — the hint is a one-time
    // nudge, not something that should linger indefinitely either way.
    const dismissTimer = window.setTimeout(() => this.dismissHint(), 2800);
    this.destroyRef.onDestroy(() => window.clearTimeout(dismissTimer));
  }

  private readMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 900;
  }

  private readReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** A gentle curve from the source to each node, bulging perpendicular to the spoke. */
  pathFor(node: HubNodeSpec): string {
    const cx = this.cx();
    const cy = this.cy();
    const dx = node.x - cx;
    const dy = node.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const bulge = 18;
    const qx = (cx + node.x) / 2 - (dy / len) * bulge;
    const qy = (cy + node.y) / 2 + (dx / len) * bulge;
    return `M${cx},${cy} Q${qx},${qy} ${node.x},${node.y}`;
  }

  private labelOffset(node: HubNodeSpec): { x: number; y: number; dx: number; dy: number } {
    const cx = this.cx();
    const cy = this.cy();
    const dx = node.x - cx;
    const dy = node.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: node.x + (dx / len) * LABEL_GAP, y: node.y + (dy / len) * LABEL_GAP, dx, dy };
  }

  labelX(node: HubNodeSpec): number {
    return this.labelOffset(node).x;
  }

  labelY(node: HubNodeSpec): number {
    return this.labelOffset(node).y + 4;
  }

  labelAnchor(node: HubNodeSpec): 'start' | 'middle' | 'end' {
    const { dx } = this.labelOffset(node);
    if (dx > 18) {
      return 'start';
    }
    if (dx < -18) {
      return 'end';
    }
    return 'middle';
  }
}
