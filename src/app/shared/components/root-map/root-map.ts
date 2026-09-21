import { AfterViewInit, Component, DestroyRef, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';
import { CtaPill } from '../cta-pill/cta-pill';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';

interface MapNode {
  readonly id: string;
  readonly label: string;
}

interface MapLink {
  readonly from: string;
  readonly to: string;
  /** 'sr' = symptom→condition, 'rt' = condition→root — which layer reveal gates this link's own draw-in, independent of whether it's "lit" (traced). */
  readonly kind: 'sr' | 'rt';
}

// Draft data — an illustrative pattern map, not a clinical claim. The exact
// symptom → condition → root connections here are a starting point for the
// Ease Disease team to review and refine, same as the "not a diagnosis"
// disclaimer already used elsewhere on the page.
const SYMPTOMS: readonly MapNode[] = [
  { id: 'bloat', label: 'Bloating' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'skin', label: 'Skin flare-ups' },
  { id: 'fog', label: 'Brain fog' },
  { id: 'sleep', label: 'Poor sleep' },
  { id: 'cycle', label: 'Cycle changes' },
  { id: 'mood', label: 'Low mood' },
];

const CONDITIONS: readonly MapNode[] = [
  { id: 'inflammation', label: 'Inflammation' },
  { id: 'bloodsugar', label: 'Blood-sugar dips' },
  { id: 'digestion', label: 'Weak digestion' },
  { id: 'nervous', label: 'Nervous system overdrive' },
  { id: 'hormonal', label: 'Hormonal signalling' },
];

// Same four roots as the rest of the page's "rootCauses" content — this map
// is the interactive version of that same claim.
const ROOTS: readonly MapNode[] = [
  { id: 'gut', label: 'Gut imbalance' },
  { id: 'sugar', label: 'Blood-sugar swings' },
  { id: 'hormone', label: 'Hormone imbalance' },
  { id: 'stress', label: 'Chronic stress response' },
];

// Each symptom traces to a single primary condition — two-per-symptom made
// this layer read as a tangle of crossing lines. The convergence (several
// symptoms/conditions meeting at the same root) still happens one layer
// down, which is where the "same roots" point actually needs to land.
const SYMPTOM_TO_CONDITION: Readonly<Record<string, readonly string[]>> = {
  bloat: ['digestion'],
  fatigue: ['bloodsugar'],
  skin: ['inflammation'],
  fog: ['inflammation'],
  sleep: ['nervous'],
  cycle: ['hormonal'],
  mood: ['inflammation'],
};

const CONDITION_TO_ROOT: Readonly<Record<string, readonly string[]>> = {
  inflammation: ['gut', 'hormone'],
  bloodsugar: ['sugar'],
  digestion: ['gut'],
  nervous: ['stress'],
  hormonal: ['hormone', 'stress'],
};

const EXAMPLE_TRACE: ReadonlySet<string> = new Set(['bloat', 'skin']);

const STEP_ACTIVATION_LINE_DESKTOP = 0.55;
const STEP_ACTIVATION_LINE_MOBILE = 0.8;
const DESKTOP_BREAKPOINT = 900;

/**
 * Six beats scrolling past the sticky map, in step with its reveal: the
 * heading, the four narration cards, then the closing "trace your own"
 * card. Same numbering at every breakpoint — desktop lays the map beside
 * this column, mobile stacks it on top, but the beat count and the sync
 * are identical either way.
 */
const BEAT_COUNT = 6;

/**
 * The interactive root map — symptoms trace down through underlying
 * patterns to the handful of root causes the rest of the page argues for.
 * Sticky map beside (desktop) or above (mobile) a column of narration steps;
 * clicking a symptom re-traces the connecting lines live.
 */
@Component({
  selector: 'app-root-map',
  imports: [CtaPill, EyebrowLabel],
  template: `
    <div class="root-map-grid">
      <div class="root-map-scroll-group">
      <div class="root-map-narration" #narrationContainer>
        <div class="root-map-step root-map-step--lead" [class.active]="activeStep() === 0">
          <app-eyebrow-label text="Where it often starts" />
          <h2 id="root-map-heading" class="root-map-heading">Different symptoms often grow from the same roots.</h2>
        </div>
        <article class="root-map-step" [class.active]="activeStep() === 1">
          <h3>It starts with what you feel.</h3>
          <p>Seven everyday complaints. Most people treat each one on its own — a cream for the skin, an antacid for the bloating, coffee for the fatigue.</p>
        </article>
        <article class="root-map-step" [class.active]="activeStep() === 2">
          <h3>Underneath, fewer things are going on.</h3>
          <p>Many symptoms share the same handful of processes. Inflammation, for one, can surface in the skin, the mood and the gut at once.</p>
        </article>
        <article class="root-map-step" [class.active]="activeStep() === 3">
          <h3>One level deeper, the lines converge.</h3>
          <p>Seven symptoms trace back to four places where problems often begin — and most of those paths pass through the gut.</p>
        </article>
        <article class="root-map-step root-map-step--raise" [class.active]="activeStep() === 4">
          <h3>Bloating and skin flare-ups seem unrelated.</h3>
          <p>Follow both down and they meet at gut imbalance. That shared root is why treating the skin on its own so often doesn't last.</p>
        </article>
      </div>

      <div class="root-map-wrap">
        <div class="root-map" [class.focus]="focusSet().size > 0" #mapBox>
          <svg class="root-map-links" #linksSvg aria-hidden="true">
            @for (link of links; track link.from + '>' + link.to; let i = $index) {
              <path pathLength="1" [attr.d]="pathData()[i] ?? ''" [class.visible]="isLinkVisible(link)" [class.lit]="isLinkLit(link)" />
            }
          </svg>

          <div class="root-map-layer">
            <p class="root-map-layer-label">What you feel</p>
            <div class="root-map-nodes">
              @for (node of symptoms; track node.id) {
                <button
                  type="button"
                  class="root-map-node"
                  [attr.data-id]="node.id"
                  [class.lit]="isLit(node.id)"
                  [class.selected]="selected().has(node.id)"
                  [attr.aria-pressed]="selected().has(node.id)"
                  (click)="toggleSymptom(node.id)"
                >
                  {{ node.label }}
                </button>
              }
            </div>
          </div>

          <div class="root-map-layer" [class.layer-hidden]="!showConditions()">
            <p class="root-map-layer-label">What's really going on</p>
            <div class="root-map-nodes">
              @for (node of conditions; track node.id) {
                <span class="root-map-node root-map-node--static" [attr.data-id]="node.id" [class.lit]="isLit(node.id)">{{ node.label }}</span>
              }
            </div>
          </div>

          <div class="root-map-layer" [class.layer-hidden]="!showRoots()">
            <p class="root-map-layer-label">Where it often starts</p>
            <div class="root-map-nodes">
              @for (node of roots; track node.id) {
                <span class="root-map-node root-map-node--root" [attr.data-id]="node.id" [class.lit]="isLit(node.id)">{{ node.label }}</span>
              }
            </div>
          </div>

          <p class="root-map-caption">* This map shows common patterns, not a diagnosis. Please speak to our qualified practitioner for your diagnosis.</p>
        </div>
      </div>
      </div>

      <article class="root-map-step root-map-step--last" [class.active]="activeStep() === 5" #lastContainer>
        <h3>Now trace your own.</h3>
        <p>Tap the symptoms you live with above and watch where they lead.</p>
        <div class="root-map-summary" aria-live="polite">
          @if (selected().size === 0) {
            <p>Tap any symptom above to see where it can lead.</p>
          } @else {
            <p>{{ summaryText() }}</p>
            <ul>
              @for (root of reachedRootNodes(); track root.id) {
                <li>{{ root.label }}</li>
              }
            </ul>
          }
        </div>
        <div class="cta-row">
          <app-cta-pill label="Find my roots in a consultation" variant="primary" (pressed)="bookRequested.emit()" />
          @if (selected().size > 0) {
            <button type="button" class="root-map-clear" (click)="clearSelection()">Clear my symptoms</button>
          }
        </div>
        <p class="root-map-fine">This map shows common patterns, not a diagnosis. Please speak to our qualified practitioner for your diagnosis.</p>
      </article>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Mobile: .root-map-scroll-group is a REAL box wrapping the map + the
       narration, stacked normally (map first). That shared box is what
       gives the sticky map its "room to stick" — it sticks while scrolling
       through the narration beneath it, then releases smoothly and
       continues scrolling away right where the group ends, because that's
       genuinely where its containing block ends. The closing card sits
       *outside* this group entirely, so the map is never on the hook to
       overlap it — there's nothing forcing the two to share space. */
    .root-map-grid {
      display: block;
    }

    .root-map-scroll-group {
      display: block;
    }

    @media (min-width: 900px) {
      /* Desktop: one continuous left-hand column (narration, then the
         closing card sharing the same column via two rows) beside a sticky
         map that spans both those rows. display: contents dissolves the
         scroll-group wrapper here, so the map and the narration become
         direct grid items again — a sticky element's "room to stick" comes
         from its immediate containing block, and a plain (non-contents)
         wrapper div would shrink-wrap to the sticky child's own height
         instead of the full narration+last span it needs on this layout. */
      .root-map-scroll-group {
        display: contents;
      }
      .root-map-grid {
        display: grid;
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
        gap: var(--sp-12);
        align-items: start;
      }
      .root-map-narration {
        grid-column: 1;
        grid-row: 1;
      }
      .root-map-step--last {
        grid-column: 1;
        grid-row: 2;
      }
      .root-map-wrap {
        grid-column: 2;
        grid-row: 1 / 3;
        position: sticky;
        top: 0;
        height: 100vh;
        padding-block: var(--sp-8);
      }
    }

    /* Mobile: no sticky, no fixed height, no background — just a plain
       block sitting after the narration and before the closing card, sized
       to whatever its (fully-revealed) content actually needs. A fixed-height
       sticky box here kept overflowing into the narration no matter how far
       it was stretched or how compact the pills got — three full layers of
       pills plus the connecting lines just don't fit in a partial-viewport
       box on a small screen. Letting it take its natural height removes the
       constraint that was causing the overlap in the first place. */
    .root-map-wrap {
      display: flex;
      align-items: center;
      padding-block: var(--sp-8);
    }

    .root-map {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--sp-10);
    }

    .root-map-links {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    /* Every link between two *revealed* layers draws in faintly on its own —
       this is the map's actual illustration, the thing that makes it read
       as "roots" rather than three unrelated rows of pills. The .lit class is a
       brighter highlight layered on top for whichever path is currently
       traced (hover/select/example), not a gate on visibility itself.
       pathLength="1" (set in the template) means dasharray/dashoffset of 1
       always mean "whole path", regardless of each path's real pixel
       length, so one dashoffset transition draws every link in evenly. */
    .root-map-links path {
      fill: none;
      stroke: color-mix(in oklab, var(--oxblood) 26%, transparent);
      stroke-width: 1.4;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      transition:
        stroke-dashoffset 1.1s var(--ease),
        stroke var(--dur-base) var(--ease),
        stroke-width var(--dur-base) var(--ease),
        opacity var(--dur-base) var(--ease);
    }

    .root-map-links path.visible {
      stroke-dashoffset: 0;
    }

    .root-map-links path.lit {
      stroke: var(--terracotta);
      stroke-width: 2.2;
    }

    .root-map.focus .root-map-links path.visible:not(.lit) {
      opacity: 0.3;
    }

    .root-map.focus .root-map-node:not(.lit):not(.selected) {
      opacity: 0.45;
    }

    .root-map-layer {
      position: relative;
      z-index: 1;
      transition:
        opacity var(--dur-scene) var(--ease-out-soft),
        transform var(--dur-scene) var(--ease-out-soft);
    }

    .root-map-layer.layer-hidden {
      opacity: 0;
      transform: translateY(10px);
    }

    .root-map-layer-label {
      margin-bottom: var(--sp-3);
      text-align: center;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--text-quiet-light);
    }

    .root-map-nodes {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--sp-2);
    }

    .root-map-node {
      display: inline-flex;
      align-items: center;
      min-height: 38px;
      padding: 0 var(--sp-4);
      border-radius: var(--r-pill);
      border: 1px solid color-mix(in oklab, var(--oxblood) 30%, transparent);
      background: color-mix(in oklab, var(--oxblood) 6%, var(--ivory));
      color: var(--oxblood-deep);
      font-family: var(--font-body);
      font-size: 0.92rem;
      cursor: default;
      transition:
        background var(--dur-base) var(--ease),
        border-color var(--dur-base) var(--ease),
        color var(--dur-base) var(--ease),
        opacity var(--dur-base) var(--ease);
    }

    button.root-map-node {
      cursor: pointer;
      min-height: 44px;
    }

    button.root-map-node:hover {
      border-color: var(--oxblood);
    }

    .root-map-node--root {
      font-family: var(--font-display);
      font-size: 1.02rem;
      min-height: 44px;
      padding: 0 var(--sp-5);
      border-color: color-mix(in oklab, var(--oxblood) 45%, transparent);
    }

    .root-map-node.lit {
      background: var(--terracotta);
      border-color: var(--terracotta);
      color: var(--ivory);
    }

    .root-map-node.selected {
      background: var(--oxblood);
      border-color: var(--oxblood);
      color: var(--ivory);
    }

    /* Only on larger screens, where the sticky map has its own dedicated
       column and room underneath the roots layer for a quiet caption. On
       mobile the map's box is already tight (see the <900px overflow fix
       above), and the same line already appears at the end of the steps. */
    .root-map-caption {
      display: none;
    }

    @media (min-width: 900px) {
      .root-map-caption {
        display: block;
        margin-top: var(--sp-3);
        text-align: center;
        font-size: 9px;
        line-height: 1.5;
        letter-spacing: 0.01em;
        color: color-mix(in oklab, var(--text-quiet-light) 70%, transparent);
      }
    }

    .root-map-narration {
      position: relative;
      z-index: 1;
    }

    /* The heading is just the first card in the same scrolling sequence as
       the narration below it — no sticky pin, no background card behind
       it — it fades in and out with scroll exactly like every other step. */
    .root-map-step--lead {
      max-width: 46ch;
    }

    .root-map-heading {
      margin-top: var(--sp-3);
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(1.9rem, 1.4rem + 2vw, 2.6rem);
      line-height: 1.15;
      color: var(--ink);
      max-width: 16ch;
    }

    .root-map-step {
      min-height: 56vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      opacity: 0.4;
      transition: opacity var(--dur-base) var(--ease);
    }

    @media (min-width: 900px) {
      .root-map-step {
        min-height: 70vh;
      }

      /* Nudged up rather than dead-centered — this is the card most likely
         to sit right alongside the fully-lit trace (bloat/skin → gut/
         hormone), and centered it read as sitting a little low against it. */
      .root-map-step--raise {
        padding-bottom: 10vh;
      }
    }

    .root-map-step.active {
      opacity: 1;
    }

    .root-map-step h3 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(1.5rem, 1.2rem + 1.4vw, 2.1rem);
      line-height: 1.15;
      color: var(--ink);
      max-width: 18ch;
    }

    .root-map-step p {
      margin-top: var(--sp-4);
      color: var(--text-quiet-light);
      line-height: var(--lh-body);
      max-width: 42ch;
    }

    /* Centered like every other card (min-height + justify-content:center
       from .root-map-step), not left to sit wherever its own auto content
       height happens to land — it was reading noticeably higher/lower than
       the narration cards above it. Extra scroll room on top of that
       (min-height bumped past the other cards', plus more bottom padding)
       so this closing beat doesn't feel like it ends the moment it arrives. */
    .root-map-step--last {
      padding-block: var(--sp-8) var(--sp-20);
    }

    @media (min-width: 900px) {
      .root-map-step--last {
        min-height: 90vh;
      }
    }

    /* Mobile: the map is height-constrained again (sticky at the top of the
       single column), and the pills/layer gaps read as comfortably compact
       rather than desktop-sized on a narrow screen. Steps are top-aligned
       instead of centered in their tall min-height box, since centering is
       the *cross* axis for a row-flex step and the *main* axis here (the
       step is column-flex) — align-items would have centered nothing and
       silently no-op'd, same class of axis bug fixed earlier in .hook. */
    @media (max-width: 899px) {
      .root-map {
        gap: 30px;
      }

      .root-map-node {
        font-size: 0.8rem;
        padding: 0 10px;
        min-height: 30px;
      }

      button.root-map-node {
        min-height: 36px;
      }

      .root-map-node--root {
        font-size: 0.88rem;
        min-height: 34px;
        padding: 0 12px;
      }

      .root-map-layer-label {
        font-size: 0.72rem;
        margin-bottom: 6px;
      }

      .root-map-nodes {
        gap: 6px;
      }

      .root-map-step {
        min-height: 50vh;
        justify-content: flex-start;
        padding-top: 3vh;
      }

      .root-map-step--lead {
        padding-top: 5vh;
      }

      .root-map-step--last {
        padding-block: var(--sp-6) 14vh;
      }

      .root-map-wrap {
        padding-block: var(--sp-6);
      }
    }

    .root-map-summary {
      margin-top: var(--sp-5);
      min-height: 3.2em;
    }

    .root-map-summary p {
      color: var(--ink);
    }

    .root-map-summary ul {
      margin: var(--sp-3) 0 0;
      padding: 0;
      list-style: none;
    }

    .root-map-summary li {
      padding: var(--sp-2) 0;
      border-top: 1px solid var(--rule-on-light);
      color: var(--text-quiet-light);
    }

    .cta-row {
      margin-top: var(--sp-6);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--sp-4);
    }

    .root-map-clear {
      min-height: 44px;
      padding: 0 var(--sp-4);
      border-radius: var(--r-pill);
      background: transparent;
      color: var(--oxblood-deep);
      border: 1px solid color-mix(in oklab, var(--oxblood) 40%, transparent);
      font-family: var(--font-body);
      font-size: 0.9rem;
      cursor: pointer;
    }

    .root-map-fine {
      margin-top: var(--sp-8);
      font-size: 0.82rem;
      color: var(--text-quiet-light);
      max-width: 46ch;
    }

    @media (prefers-reduced-motion: reduce) {
      .root-map-links path,
      .root-map-layer,
      .root-map-node,
      .root-map-step {
        transition: none;
      }
    }
  `,
})
export class RootMap implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly symptoms = SYMPTOMS;
  protected readonly conditions = CONDITIONS;
  protected readonly roots = ROOTS;

  protected readonly links: readonly MapLink[] = [
    ...Object.entries(SYMPTOM_TO_CONDITION).flatMap(([from, tos]) => tos.map((to) => ({ from, to, kind: 'sr' as const }))),
    ...Object.entries(CONDITION_TO_ROOT).flatMap(([from, tos]) => tos.map((to) => ({ from, to, kind: 'rt' as const }))),
  ];

  readonly bookRequested = output<void>();

  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly activeStep = signal(0);

  // The map is only synced to scroll on desktop, where it's beside the
  // narration in its own sticky column. On mobile it's a plain block that
  // sits after the narration — a fixed-height sticky box there kept
  // overflowing no matter how compact the layers got, so it just shows
  // fully revealed the moment it's reached instead.
  protected readonly isDesktop = signal(false);

  protected readonly focusSet = computed<ReadonlySet<string>>(() => {
    if (this.selected().size > 0) {
      return this.selected();
    }
    return this.isDesktop() && this.activeStep() === 4 ? EXAMPLE_TRACE : new Set();
  });

  protected readonly reachedConditionIds = computed(() => {
    const reached = new Set<string>();
    for (const id of this.focusSet()) {
      for (const c of SYMPTOM_TO_CONDITION[id] ?? []) {
        reached.add(c);
      }
    }
    return reached;
  });

  protected readonly reachedRootIds = computed(() => {
    const reached = new Set<string>();
    for (const id of this.reachedConditionIds()) {
      for (const r of CONDITION_TO_ROOT[id] ?? []) {
        reached.add(r);
      }
    }
    return reached;
  });

  protected readonly reachedRootNodes = computed(() => this.roots.filter((r) => this.reachedRootIds().has(r.id)));

  // Desktop reveals conditions/roots in step with the narration scrolling
  // past the sticky map (beats: 0 heading, 1-4 narration, 5 closing).
  // Mobile just shows the map fully revealed the moment it's reached.
  protected readonly showConditions = computed(() => this.selected().size > 0 || !this.isDesktop() || this.activeStep() >= 2);
  protected readonly showRoots = computed(() => this.selected().size > 0 || !this.isDesktop() || this.activeStep() >= 3);

  protected readonly summaryText = computed(() => {
    const n = this.selected().size;
    const rootCount = this.reachedRootNodes().length;
    if (n === 0 || rootCount === 0) {
      return '';
    }
    return `${n} symptom${n > 1 ? 's' : ''} can trace back to ${rootCount} possible root${rootCount > 1 ? 's' : ''}.`;
  });

  private readonly mapBox = viewChild<ElementRef<HTMLElement>>('mapBox');
  private readonly linksSvg = viewChild<ElementRef<SVGSVGElement>>('linksSvg');
  private readonly narrationContainer = viewChild<ElementRef<HTMLElement>>('narrationContainer');
  private readonly lastContainer = viewChild<ElementRef<HTMLElement>>('lastContainer');

  protected readonly pathData = signal<readonly string[]>([]);

  private layoutRaf = 0;
  private scrollRaf = 0;

  protected isLit(id: string): boolean {
    return this.focusSet().has(id) || this.reachedConditionIds().has(id) || this.reachedRootIds().has(id);
  }

  protected isLinkVisible(link: MapLink): boolean {
    return link.kind === 'sr' ? this.showConditions() : this.showRoots();
  }

  protected isLinkLit(link: MapLink): boolean {
    return this.isLit(link.from) && this.isLit(link.to);
  }

  protected toggleSymptom(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selected.set(next);
    this.queueLayout();
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
    this.queueLayout();
  }

  ngAfterViewInit(): void {
    const onScroll = () => {
      if (this.scrollRaf) {
        return;
      }
      this.scrollRaf = requestAnimationFrame(() => {
        this.scrollRaf = 0;
        this.updateActiveStep();
      });
    };
    const onResize = () => {
      this.updateActiveStep();
      this.queueLayout();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    let resizeObserver: ResizeObserver | undefined;
    const mapEl = this.mapBox()?.nativeElement;
    if (mapEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => this.queueLayout());
      resizeObserver.observe(mapEl);
    }

    this.updateActiveStep();
    this.queueLayout();

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(this.scrollRaf);
      cancelAnimationFrame(this.layoutRaf);
      resizeObserver?.disconnect();
    });
  }

  private queueLayout(): void {
    if (this.layoutRaf) {
      return;
    }
    this.layoutRaf = requestAnimationFrame(() => {
      this.layoutRaf = 0;
      this.layout();
    });
  }

  private layout(): void {
    const mapEl = this.mapBox()?.nativeElement;
    const svg = this.linksSvg()?.nativeElement;
    if (!mapEl || !svg) {
      return;
    }
    const box = mapEl.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);

    const paths = this.links.map((link) => {
      const elA = mapEl.querySelector<HTMLElement>(`[data-id="${link.from}"]`);
      const elB = mapEl.querySelector<HTMLElement>(`[data-id="${link.to}"]`);
      if (!elA || !elB) {
        return '';
      }
      const a = elA.getBoundingClientRect();
      const b = elB.getBoundingClientRect();
      const x1 = a.left + a.width / 2 - box.left;
      const y1 = a.bottom - box.top;
      const x2 = b.left + b.width / 2 - box.left;
      const y2 = b.top - box.top;
      const midY = (y1 + y2) / 2;
      return `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
    });

    this.pathData.set(paths);
  }

  /**
   * Which "beat" is active is driven by how far the activation line has
   * moved through narration + the closing card *combined, as a whole*
   * (a single measurement spanning both), rather than by testing each
   * card's own top individually — if any one card renders shorter than its
   * neighbours, per-card testing can jump straight past several activation
   * thresholds in one scroll frame, which reads like everything happening
   * at once. Dividing one continuous progress value evenly across all six
   * beats (heading, four narration cards, closing card) can't skip one
   * regardless of any individual card's size. This still drives the
   * narration cards' own active/inactive fade at every breakpoint — only
   * the map's reveal (see showConditions/showRoots) is desktop-only.
   */
  private updateActiveStep(): void {
    const narrationEl = this.narrationContainer()?.nativeElement;
    if (!narrationEl || narrationEl.clientHeight === 0) {
      return;
    }
    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    if (isDesktop !== this.isDesktop()) {
      this.isDesktop.set(isDesktop);
    }
    const line = window.innerHeight * (isDesktop ? STEP_ACTIVATION_LINE_DESKTOP : STEP_ACTIVATION_LINE_MOBILE);

    const narrationRect = narrationEl.getBoundingClientRect();
    const top = narrationRect.top;
    const lastRect = this.lastContainer()?.nativeElement.getBoundingClientRect();
    const bottom = lastRect ? lastRect.bottom : narrationRect.bottom;

    const progress = Math.max(0, Math.min(1, (line - top) / (bottom - top)));
    const active = Math.min(BEAT_COUNT - 1, Math.floor(progress * BEAT_COUNT));

    if (active !== this.activeStep()) {
      this.activeStep.set(active);
      this.queueLayout();
    }
  }
}
