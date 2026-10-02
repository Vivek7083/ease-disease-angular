import { AfterViewInit, Component, DestroyRef, ElementRef, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { CanvasStopDirective } from '../../core/directives/canvas-stop';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal';
import { BookingCtaService } from '../../core/services/booking-cta';
import { Wordmark } from '../../shared/components/wordmark/wordmark';
import { CtaPill } from '../../shared/components/cta-pill/cta-pill';
import { EyebrowLabel } from '../../shared/components/eyebrow-label/eyebrow-label';
import { EvidenceTick } from '../../shared/components/evidence-tick/evidence-tick';
import { GutHub } from '../../shared/components/gut-hub/gut-hub';
import { type Level } from '../../shared/components/level-card/level-card';
import { LevelSelector } from '../../shared/components/level-selector/level-selector';
import { type TeamMember } from '../../shared/components/team-card/team-card';
import { ExpertCarousel } from '../../shared/components/expert-carousel/expert-carousel';
import { RootMap } from '../../shared/components/root-map/root-map';
import { Results } from '../../shared/components/results/results';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

interface RootCause {
  readonly name: string;
  readonly symptoms: string;
  readonly description: string;
}

interface HookPoint {
  readonly title: string;
  readonly body: string;
  /** Extra copy tucked behind a "Read more" toggle; omitted when the body is short enough. */
  readonly more?: string;
  readonly icon: 'doctor' | 'root' | 'ai' | 'balance';
  readonly image: string;
  readonly imageAlt: string;
}

interface TreatStep {
  readonly title: string;
  readonly body: string;
  /** Shorter version used on the desktop timeline only — four columns of
   *  full mobile-length body copy left no room for the illustration to
   *  actually read as the focus, so desktop gets the condensed version. */
  readonly bodyShort: string;
}

@Component({
  selector: 'app-home',
  imports: [
    NgOptimizedImage,
    NgTemplateOutlet,
    CanvasStopDirective,
    ScrollRevealDirective,
    Wordmark,
    CtaPill,
    EyebrowLabel,
    EvidenceTick,
    GutHub,
    LevelSelector,
    ExpertCarousel,
    RootMap,
    Results,
    SiteFooter,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly bookingCta = inject(BookingCtaService);

  /** Descent, turn, team and close are on hold while Packages is reworked into the Programme section above. */
  protected readonly showRemainingSections = false;

  constructor() {
    this.bookingCta.registerHandler(() => this.bookConsultation());
  }

  protected bookConsultation(): void {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  protected jumpToRootMap(): void {
    document.getElementById('root-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Carves the booking CTA out of step 1's own body copy (the literal
   * phrase "30-minute call") instead of tacking on a separate button —
   * one less element competing for space/height in the node column, and
   * one less thing that can wrap onto its own line oddly. body/bodyShort
   * stay the single source of truth for the text; this just finds where
   * the phrase sits in whichever of the two is showing.
   */
  protected splitBodyAroundCta(text: string, phrase: string): { before: string; link: string; after: string } | null {
    const index = text.indexOf(phrase);
    if (index === -1) {
      return null;
    }
    return { before: text.slice(0, index), link: phrase, after: text.slice(index + phrase.length) };
  }

  /** How We Treat · Step 1 — topics that surface one by one during the call illustration. */
  protected readonly treatStepOneTags = ['Diet', 'Sleep', 'Past reports', 'Lifestyle', 'Goals'] as const;

  /**
   * Desktop's landscape (16:9) illustrations — generated separately from
   * the mobile portrait set, not cropped from them. Step 1's already has
   * its own window chrome (macOS traffic lights, call controls) baked
   * into the image itself, so the surrounding markup doesn't draw a
   * second frame on top of it.
   */
  protected readonly treatDesktopImages: readonly { src: string; alt: string }[] = [
    { src: 'images/treat-step1-laptop.png', alt: 'A nutritionist on a video consultation call.' },
    { src: 'images/treat-step2-laptop.png', alt: 'Hands holding a blood test vial and a lab result checklist card.' },
    { src: 'images/treat-step3-laptop.png', alt: 'Hands holding a bowl of whole foods and a supplement bottle.' },
    { src: 'images/treat-step4-laptop.png', alt: 'Hands holding an open journal with a checked-off list beside a cup of tea.' },
  ];

  /**
   * ---------------- How We Treat · pinned step sequence ----------------
   * Same pinned, scroll-scrubbed deck mechanic as the Hook section's
   * desktop track, but on mobile — each step's content and illustration
   * share one spot and cross-dissolve into the next as you scroll, rather
   * than stacking one after another down the page.
   *
   * The plateau is deliberately wide (most of each step's travel): the
   * illustration needs to actually hold fully visible for a readable beat,
   * not just flash past mid-crossfade. A connecting line grows beneath the
   * active step's badge during that same hold (see treatLineProgress) —
   * once it finishes growing, a short, quick burst (the narrow remaining
   * fade) swaps in the next step. So the "wait" is spent watching the line
   * connect forward, not watching two steps smear through each other.
   */
  /**
   * bodyShort is deliberately staged to render as exactly one line fewer
   * per step — 4 lines, 3, 2, 1 at the desktop column width — not just
   * trimmed by feel. That's what reads as "a sequence of steps" on the
   * desktop timeline: each node starts at the same line (title/content/
   * image share the same .treat-node-copy gap in every column, see
   * .treat-node-copy), and the row-to-row step-down comes purely from one
   * fewer line of text each time, not from forcing images to different
   * rows. Re-tune with treat-text-fit.js (temporary Playwright script, see
   * the project's verification workflow) if the copy or column width
   * changes and the line counts drift off the 4/3/2/1 staircase.
   */
  protected readonly treatSteps: readonly TreatStep[] = [
    {
      title: 'We start by listening',
      body: "Before anything else, we want your side of the story — your symptoms, your days, what's already been tried. We'll go through all of it together in your first 30-minute call, nothing rushed, nothing assumed.",
      bodyShort:
        "Your symptoms, your days, what's already been tried — we go through it together in your first 30-minute call, nothing rushed.",
    },
    {
      title: 'Then we look for proof',
      body: "Blood tests chosen for you get to why it's happening, not just what's showing up. We start you on a simple anti-inflammatory, elimination diet right away too, so healing begins before results even come back.",
      bodyShort: "Blood tests chosen for you get to why it's happening, not just what's showing up.",
    },
    {
      title: 'Food first, then supplements',
      body: 'We use food as medicine first. Supplements only join in where your results and history actually point to them — never by default.',
      bodyShort: 'Food first, supplements only when results call for it.',
    },
    {
      title: 'What makes it last',
      body: 'Sleep, stress and mindset shape recovery as much as food does. Regular check-ins keep the plan working as your life changes.',
      bodyShort: 'Sleep and stress matter too.',
    },
  ];

  /**
   * Scroll budget per step, in vh — the pin's total height is this × step
   * count. Balances two pulls in opposite directions: a step needs to hold
   * still long enough to actually read the body copy (too little and it
   * flashes past mid-scroll), but on a phone, scroll distance is physical
   * effort (each screen-height is roughly a swipe) — three steps at 150vh
   * each meant ~4-5 swipes just to get through this one section, which is
   * exactly the "takes a lot of effort" complaint. This is the middle
   * ground: a real, readable hold per step without turning the section
   * into a long haul.
   */
  protected readonly treatVhPerStep = 95;

  /**
   * Same trailing-hold trick as HOOK_DRAG_PHASE: the drag through all steps
   * only uses this fraction of the pin's scrollable range, so the last step
   * reaches full view and then actually holds still for a beat before the
   * pin releases, instead of arriving and being yanked away in the same
   * instant.
   */
  private static readonly TREAT_DRAG_PHASE = 0.82;
  /**
   * Must stay under 0.5: plateau+fade sum to 1 (the full unit spacing
   * between steps) for a gap-free handoff, but the plateau ALSO can't pass
   * 0.5 on its own — past that, step i and step i+1's plateaus start
   * overlapping and both sit at full opacity simultaneously, which is the
   * garbled double-exposed text this was fixed from. Same ratio Hook's
   * desktop deck already proved out.
   */
  private static readonly TREAT_CARD_PLATEAU = 0.45;
  private static readonly TREAT_CARD_FADE = 0.55;
  /** >1 narrows the illustration's own visible window relative to the
   *  content's (see treatIllustrationVisibility) — it crosses the same
   *  plateau/fade thresholds sooner on both sides, so it departs before
   *  the content does and arrives after the new content has settled in. */
  private static readonly TREAT_ILLUSTRATION_STRETCH = 1.6;
  /**
   * Vertical drift as a step crosses in/out. Kept small deliberately — the
   * sticky viewport has very little vertical slack around the illustration
   * (it's sized close to the full available height), so anything much
   * bigger than this pushes the illustration far enough to get clipped by
   * the viewport's own overflow:hidden mid-transition, which read as "the
   * illustration isn't fully visible." This is enough for a subtle
   * "connected" drift without risking that.
   */
  private static readonly TREAT_CARD_PARALLAX_PX = 20;

  private readonly treatPin = viewChild<ElementRef<HTMLElement>>('treatPin');
  private readonly treatPinProgress = signal(0);

  protected readonly treatDragProgress = computed(() => Home.clamp01(this.treatPinProgress() / Home.TREAT_DRAG_PHASE));
  protected readonly treatDragUnits = computed(() => this.treatDragProgress() * (this.treatSteps.length - 1));

  private treatCardDistance(i: number): number {
    return this.treatDragUnits() - i;
  }

  /**
   * 0..1 growth of the connecting line trailing below step i's badge, from
   * "just arrived" (0) to "about to hand off to step i+1" (1) — the same
   * units value driving the crossfade, just read as forward-only progress
   * past this step instead of distance from it. Reaching 1 lines up exactly
   * with step i+1 reaching full opacity (see treatCardVisibility), so the
   * line finishes growing right as the handoff completes.
   */
  protected treatLineProgress(i: number): number {
    return Home.clamp01(this.treatDragUnits() - i);
  }

  protected treatCardVisibility(i: number): number {
    const distance = Math.abs(this.treatCardDistance(i));
    if (distance <= Home.TREAT_CARD_PLATEAU) {
      return 1;
    }
    if (distance >= Home.TREAT_CARD_PLATEAU + Home.TREAT_CARD_FADE) {
      return 0;
    }
    return 1 - (distance - Home.TREAT_CARD_PLATEAU) / Home.TREAT_CARD_FADE;
  }

  protected treatCardTransform(i: number): string {
    const delta = Home.clampSigned(this.treatCardDistance(i), -1, 1);
    return `translateY(${delta * Home.TREAT_CARD_PARALLAX_PX}px)`;
  }

  /**
   * Dark text (and the solid badge circle) on a light canvas stays
   * distractingly legible even at low opacity — two faint-but-crisp
   * paragraphs, or two overlapping "01"/"02" badges, read as "garbled," not
   * "a clean dissolve," the way a photo crossfade would. Blurring both the
   * copy AND the rail as they fade (same idea as Hook's cardImageFilter,
   * applied to text/UI instead of an image) turns the departing/arriving
   * step into a soft, indistinct shape instead of readable ghost content.
   */
  private static readonly TREAT_COPY_MAX_BLUR_PX = 6;

  protected treatCopyFilter(i: number): string {
    const blur = (1 - this.treatCardVisibility(i)) * Home.TREAT_COPY_MAX_BLUR_PX;
    return blur > 0.05 ? `blur(${blur}px)` : 'none';
  }

  /**
   * The illustration gets its own, narrower window inside the content's
   * wider one — stretching its distance-from-center by a constant factor
   * means it crosses the same plateau/fade thresholds sooner on both sides:
   * it departs while the content is still fully visible, and only arrives
   * once the new content has already settled in. That's the sequence that
   * was asked for — old illustration gone, new heading up, then the new
   * illustration appears — without needing a second, separate timeline.
   */
  protected treatIllustrationVisibility(i: number): number {
    const distance = Math.abs(this.treatCardDistance(i)) * Home.TREAT_ILLUSTRATION_STRETCH;
    if (distance <= Home.TREAT_CARD_PLATEAU) {
      return 1;
    }
    if (distance >= Home.TREAT_CARD_PLATEAU + Home.TREAT_CARD_FADE) {
      return 0;
    }
    return 1 - (distance - Home.TREAT_CARD_PLATEAU) / Home.TREAT_CARD_FADE;
  }

  protected treatCardPointerEvents(i: number): 'auto' | 'none' {
    return this.treatCardVisibility(i) > 0.5 ? 'auto' : 'none';
  }

  private updateTreatScroll(): void {
    const pin = this.treatPin()?.nativeElement;
    if (!pin) {
      this.treatPinProgress.set(0);
      return;
    }

    const rect = pin.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const scrollable = rect.height - viewportHeight;
    if (scrollable <= 0) {
      this.treatPinProgress.set(0);
      return;
    }

    const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
    this.treatPinProgress.set(scrolled / scrollable);
  }

  /**
   * ---------------- How We Treat · desktop horizontal timeline ----------------
   * Below HOOK_HORIZONTAL_BREAKPOINT, the mobile pinned deck above handles
   * this (one step fully visible at a time, crossfading into the next).
   * On a wide screen there's room to lay all four steps out left to right
   * instead — each one reveals in place as its turn in the scroll comes up,
   * a connecting line grows from its badge toward the next one, and
   * (unlike the mobile deck) nothing ever fades back out: by the end all
   * four sit on screen together as one finished timeline, the line
   * connecting all of them start to finish.
   */
  protected readonly treatHorizontal = signal(false);

  /** Shorter than the mobile per-step budget — a wheel-scroll on desktop
   *  covers distance faster than a phone swipe, and there's no illustration
   *  to hold fully visible here the way the mobile deck does (each node
   *  stays small and simply accumulates), so less scroll is needed per
   *  node for it to read as deliberate rather than rushed. */
  protected readonly treatDesktopVhPerStep = 70;

  /** Same trailing-hold idea as TREAT_DRAG_PHASE — the last node finishes
   *  revealing and the pin holds briefly before releasing into Root Map. */
  private static readonly TREAT_DESKTOP_DRAG_PHASE = 0.82;

  /** How much of a unit's travel the reveal ramp takes — the rest of the
   *  unit (after a node is fully visible) is spent just advancing toward
   *  the next node's own ramp, since this node has nothing left to animate. */
  private static readonly TREAT_NODE_RISE = 0.6;
  private static readonly TREAT_NODE_RISE_PX = 24;

  private readonly treatDesktopPin = viewChild<ElementRef<HTMLElement>>('treatPinDesktop');
  private readonly treatDesktopProgress = signal(0);

  protected readonly treatDesktopDragProgress = computed(() =>
    Home.clamp01(this.treatDesktopProgress() / Home.TREAT_DESKTOP_DRAG_PHASE),
  );
  protected readonly treatDesktopUnits = computed(() => this.treatDesktopDragProgress() * (this.treatSteps.length - 1));

  /**
   * 0..1, ramping as this node's turn arrives and staying at 1 forever
   * after — unlike the mobile deck's treatCardVisibility, there's no
   * departure fade, because nothing here ever needs to make room for
   * what's next (all four sit side by side, not stacked in the same spot).
   */
  protected treatNodeVisibility(i: number): number {
    const raw = this.treatDesktopUnits() - i;
    if (raw <= -Home.TREAT_NODE_RISE) {
      return 0;
    }
    if (raw >= 0) {
      return 1;
    }
    return 1 + raw / Home.TREAT_NODE_RISE;
  }

  protected treatNodeTransform(i: number): string {
    const rise = (1 - this.treatNodeVisibility(i)) * Home.TREAT_NODE_RISE_PX;
    return `translateY(${rise}px)`;
  }

  /**
   * 0..1 growth of the horizontal line from node i's badge toward node
   * i+1's — same idea as the mobile deck's treatLineProgress, just read
   * left-to-right instead of top-to-bottom.
   */
  protected treatNodeLineProgress(i: number): number {
    return Home.clamp01(this.treatDesktopUnits() - i);
  }

  private updateTreatDesktopScroll(): void {
    this.treatHorizontal.set(window.innerWidth >= Home.HOOK_HORIZONTAL_BREAKPOINT);

    const pin = this.treatDesktopPin()?.nativeElement;
    if (!pin) {
      this.treatDesktopProgress.set(0);
      return;
    }

    const rect = pin.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const scrollable = rect.height - viewportHeight;
    if (scrollable <= 0) {
      this.treatDesktopProgress.set(0);
      return;
    }

    const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
    this.treatDesktopProgress.set(scrolled / scrollable);
  }

  /**
   * The hook · a pinned scrollytelling track, active at every breakpoint.
   * Desktop (>=HOOK_HORIZONTAL_BREAKPOINT): a continuous horizontal slide,
   * one card per full drag of scroll — image panel one side, info the other.
   * Mobile: the pin holds and cards crossfade discretely, one per scroll
   * segment. Either way, `position: sticky` on the viewport means the pin
   * releases itself and normal scroll continues once the last card has held
   * — no extra bookkeeping needed for "let the user scroll on" after.
   */
  private static readonly HOOK_HORIZONTAL_BREAKPOINT = 900;

  /**
   * How much pinned scroll each card gets, on desktop — the pin's total
   * height is this × the card count. The middle cards (not the first, which
   * also gets a free head start from the pre-lock entry reveal, or the
   * last, which gets its own trailing hold below) only ever get their share
   * of this budget, so raising it is what actually gives them real
   * breathing room before the next one starts crossfading in, without
   * touching the shape of the crossfade curve itself (still smooth either
   * way — this only stretches it out).
   */
  protected readonly hookVhPerCard = 115;

  /**
   * On desktop, the drag through all cards uses only this fraction of the
   * pin's scrollable range — the rest is a trailing hold at the last card's
   * fully-arrived position. Without it, the last card reaches full view at
   * the exact same scroll pixel where the pin releases (progress hits 1 at
   * both), so it never actually sits still — it arrives and is immediately
   * yanked away into whatever (currently empty) comes next. Cards 1..N-1
   * don't have this problem since the drag keeps moving into the next card.
   */
  private static readonly HOOK_DRAG_PHASE = 0.82;

  /**
   * The heading holds still for this opening slice of the pin's scroll
   * range before any card is shown at all — scrolling into the hook first
   * reads as "the question arriving", then the cards answer it one by one
   * once that finishes. cardsPhaseProgress remaps the remaining range back
   * to a clean 0..1 for everything downstream (active-card index, the
   * desktop drag) so their own math doesn't need to know this dead zone
   * exists.
   */
  /**
   * No longer gates the heading's own reveal (that's hookEntryProgress,
   * driven separately as the section scrolls into view and finishes before
   * the pin ever locks) — kept at 0 so the card sequence starts moving the
   * instant pinned scrolling begins, with no extra dead scroll tacked on
   * after the heading's already fully typed.
   */
  private static readonly HEADING_REVEAL_PHASE = 0;

  private readonly hookPin = viewChild<ElementRef<HTMLElement>>('hookPin');
  private readonly hookProgress = signal(0);
  /**
   * Before the pin is fully "stuck" at the top of the viewport, its sticky
   * child (the heading) still sits at the pin's own natural position in the
   * document — which means it's already scrolling into view from the
   * bottom of the screen well before hookProgress starts moving. Gating the
   * heading's reveal on hookProgress alone left that whole entry stretch
   * showing nothing (the heading sat there fully clipped) — a blank gap
   * between the hero leaving and the pin engaging. This tracks that entry
   * directly (0 when the pin's top is at the bottom edge of the viewport, 1
   * once it reaches the top and sticks) so the heading can start typing in
   * the moment it's actually visible on screen.
   */
  private readonly hookEntryProgress = signal(0);
  private hookRaf = 0;

  protected readonly hookHorizontal = signal(false);
  protected readonly cardsPhaseProgress = computed(() =>
    Home.clamp01((this.hookProgress() - Home.HEADING_REVEAL_PHASE) / (1 - Home.HEADING_REVEAL_PHASE)),
  );
  /**
   * 0..1 as the hook section scrolls into view — the heading/eyebrow
   * reveal left-to-right as this climbs, like a line being typed out, then
   * hold fully revealed once it hits 1 (which happens right as the pin
   * engages, handing off cleanly into the card sequence). Eased (fast
   * start, settling in) rather than linear — a linear map spends its first
   * stretch of scroll producing barely-visible progress, which read as a
   * plain blank section for a beat before anything seemed to happen.
   */
  protected readonly headingRevealProgress = computed(() => Home.easeOutQuad(this.hookEntryProgress()));
  /**
   * The card track's own fade-in used to key off hookProgress, which only
   * starts moving once the pin is fully stuck — but the pin's sticky child
   * is visible (and the heading is already typing) for the whole entry
   * stretch before that. That gap meant the heading could finish typing
   * with the track still sitting at opacity 0, a blank stretch right where
   * the first card should already be waiting. Tying it to the same
   * entry-driven, eased signal as the heading means the track is already
   * fully opaque by the moment the pin locks — the first card is "already
   * loaded" the instant its viewport is reached, exactly like the heading.
   */
  protected readonly cardsOpacity = computed(() => this.headingRevealProgress());
  protected readonly hookDragProgress = computed(() => {
    if (!this.hookHorizontal()) {
      return Math.min(1, this.cardsPhaseProgress() / Home.HOOK_DRAG_PHASE);
    }
    return Home.clamp01(this.cardsPhaseProgress() / Home.HOOK_DRAG_PHASE);
  });

  /** Continuous 0..(count-1) position along the desktop drag — the single
   *  number every card's visibility/parallax below is computed from. No
   *  dwell/hold mapping on top of it: scroll maps to motion proportionally
   *  the whole way, which is what actually reads as smooth rather than a
   *  sprint-then-freeze-then-sprint rhythm. */
  protected readonly hookDragUnits = computed(() => this.hookDragProgress() * (this.hookPoints.length - 1));

  /**
   * Desktop card deck: every card is stacked in the same spot (position:
   * absolute) rather than laid out side by side on a wide track. Each one's
   * opacity/position/blur is a continuous function of its distance from the
   * current drag position — full strength on a plateau right at its own
   * "turn", fading out over the approach/departure. Because a card's fade-out
   * and its neighbor's fade-in both happen across that same window, they
   * cross-dissolve through each other rather than handing off with a cut.
   */
  /**
   * A bigger plateau (and correspondingly narrower fade) than a literal
   * 50/50 split — each card spends most of its turn fully legible, with only
   * a brief, smooth window where it's actually crossfading into its
   * neighbor. This is purely a reshaping of the opacity curve, not the
   * motion: position/scale keep moving continuously throughout regardless,
   * so narrowing the fade doesn't bring back the old sprint-then-freeze
   * abruptness — it just means less time where nothing on screen is clearly
   * readable.
   */
  private static readonly HOOK_CARD_PLATEAU = 0.4;
  private static readonly HOOK_CARD_FADE = 0.6;
  /** Subtle drift, not a full-screen throw — this is parallax, not a slide carousel. */
  private static readonly HOOK_CARD_PARALLAX_PX = 90;
  /** Blur is only ever applied to the image (see cardImageFilter) — blurring
   *  the copy made two overlapping paragraphs of blurred text during a
   *  crossfade, which read as noise, not depth. */
  private static readonly HOOK_CARD_MAX_BLUR_PX = 5;
  /** Image and copy drift at slightly different rates for a layered, dimensional feel within each card. */
  private static readonly HOOK_IMAGE_PARALLAX_FACTOR = 0.5;
  private static readonly HOOK_COPY_PARALLAX_FACTOR = 1.15;

  private cardDelta(i: number): number {
    return Home.clampSigned(this.hookDragUnits() - i, -1, 1);
  }

  protected cardVisibility(i: number): number {
    const distance = Math.abs(this.hookDragUnits() - i);
    if (distance <= Home.HOOK_CARD_PLATEAU) {
      return 1;
    }
    if (distance >= Home.HOOK_CARD_PLATEAU + Home.HOOK_CARD_FADE) {
      return 0;
    }
    return 1 - (distance - Home.HOOK_CARD_PLATEAU) / Home.HOOK_CARD_FADE;
  }

  protected cardDeckTransform(i: number): string {
    const translate = this.cardDelta(i) * Home.HOOK_CARD_PARALLAX_PX;
    const scale = 0.96 + 0.04 * this.cardVisibility(i);
    return `translateX(${translate}px) scale(${scale})`;
  }

  protected cardImageTransform(i: number): string {
    return `translateX(${this.cardDelta(i) * Home.HOOK_CARD_PARALLAX_PX * Home.HOOK_IMAGE_PARALLAX_FACTOR}px)`;
  }

  protected cardImageFilter(i: number): string {
    const blur = (1 - this.cardVisibility(i)) * Home.HOOK_CARD_MAX_BLUR_PX;
    return blur > 0.05 ? `blur(${blur}px)` : 'none';
  }

  protected cardCopyTransform(i: number): string {
    return `translateX(${this.cardDelta(i) * Home.HOOK_CARD_PARALLAX_PX * Home.HOOK_COPY_PARALLAX_FACTOR}px)`;
  }

  protected cardPointerEvents(i: number): 'auto' | 'none' {
    return this.cardVisibility(i) > 0.5 ? 'auto' : 'none';
  }

  /**
   * ---------------- Mobile · swipeable card carousel ----------------
   * Touch users reach for a swipe gesture on a stacked card, not a scroll
   * gesture — a pinned scroll-hijacked track reads as broken/stuck on a
   * phone. Below HOOK_HORIZONTAL_BREAKPOINT the hook section is plain,
   * normal-height content: scrolling the page always just scrolls the page,
   * and cards only change in response to a real horizontal swipe or a drag
   * on the pill below them.
   */
  protected readonly mobileActiveCard = signal(0);

  /** Live, unsnapped drag offset (px) while a finger is down on the track; 0 at rest. */
  private readonly mobileDragOffset = signal(0);
  protected readonly isCarouselDragging = signal(false);

  /** Keep in sync with .hook-carousel-track's own `gap` in home.scss — baked into the step distance so each index still lands exactly on the next slide. */
  private static readonly HOOK_CARD_GAP_PX = 12;

  /**
   * Typewriter fill: copy is split into words, each one filling from faint to
   * full colour in sequence (a caret trails the word being "typed"). The
   * animation only runs while a card is `is-typing`, so it replays every time
   * a card comes to the front.
   */
  protected words(text: string): string[] {
    return text.split(' ');
  }

  protected isCardTyping(i: number): boolean {
    return this.hookHorizontal() ? this.cardVisibility(i) > 0.5 : this.mobileActiveCard() === i && this.mobileHeadingRevealProgress() > 0.5;
  }

  /** Which card's "Read more" copy is open; it renders collapsed whenever that card isn't the one in front. */
  private readonly expandedCardState = signal<number | null>(null);

  protected isCardExpanded(i: number): boolean {
    return this.expandedCardState() === i && this.isCardTyping(i);
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** The "Read more" copy cut back to its last full stop that fits the card; null = untrimmed. */
  private readonly trimmedMore = signal<string | null>(null);

  protected moreText(more: string): string {
    return this.trimmedMore() ?? more;
  }

  /**
   * After the expanded copy renders, if it overflows its box, drop trailing
   * sentences until it fits — so it always ends on a full stop, never mid-way
   * or behind a scrollbar.
   */
  private fitMoreText(more: string): void {
    const sentences = more.match(/[^.!?]+[.!?]+(s|$)/g)?.map((s) => s.trim()) ?? [more];
    let keep = sentences.length;
    const step = () => {
      const el = this.host.nativeElement.querySelector<HTMLElement>(".hook-body.is-more");
      if (!el || el.scrollHeight <= el.clientHeight + 1 || keep <= 1) {
        return;
      }
      keep -= 1;
      this.trimmedMore.set(sentences.slice(0, keep).join(" "));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /** Puts any opened "Read more" copy back to its initial collapsed state. */
  private resetCardCopy(): void {
    this.expandedCardState.set(null);
    this.trimmedMore.set(null);
  }

  private readonly erasingCard = signal<number | null>(null);
  private hasToggledCopy = false;
  private static readonly HOOK_ERASE_STEP_MS = 14;
  private static readonly HOOK_ERASE_TAIL_MS = 220;

  protected isCardErasing(i: number): boolean {
    return this.erasingCard() === i;
  }

  /** Title words type first, so the body waits for them — except once the reader has toggled, when the title is long done. */
  protected bodyLead(title: string): number {
    return this.hasToggledCopy ? 0 : this.words(title).length;
  }

  /**
   * "Read more" / "Read less": the current copy erases back-to-front (words
   * fade out in reverse, caret running backwards), then the other copy types
   * in with the same fill — the card keeps its size, only the text swaps.
   */
  protected toggleCardExpanded(i: number, more: string | undefined): void {
    if (this.erasingCard() !== null || !more) {
      return;
    }
    const point = this.hookPoints[i];
    const current = this.expandedCardState() === i ? more : point.body;
    const eraseMs = Math.min(700, this.words(current).length * Home.HOOK_ERASE_STEP_MS + Home.HOOK_ERASE_TAIL_MS);
    this.erasingCard.set(i);
    setTimeout(() => {
      this.hasToggledCopy = true;
      this.expandedCardState.update((open) => (open === i ? null : i));
      this.erasingCard.set(null);
      this.trimmedMore.set(null);
      if (this.expandedCardState() === i) {
        this.fitMoreText(more);
      }
    }, eraseMs);
  }

  /** Flips on the first touch/tap/key on the stack — the "swipe / tap" hint then fades away. */
  protected readonly hookHintDismissed = signal(false);

  /** How far each card behind the front one peeks out to the right, px. */
  private static readonly HOOK_STACK_PEEK_PX = 18;
  /** Each step deeper in the stack shrinks the card by this much. */
  private static readonly HOOK_STACK_SHRINK = 0.045;
  /** Card width + gap, px — captured on pointerdown so a drag follows the finger 1:1. */
  private carouselStep = 320;

  /**
   * Stacked-deck layout: card `i` sits at a continuous offset `e` from the
   * front (0 = front, 1 = next behind it, ...; negative = already swiped
   * away to the left). `e` folds in the live drag fraction, so a swipe is a
   * smooth, interruptible blend between resting states.
   */
  protected cardStackStyle(i: number): Record<string, string> {
    const e = i - this.mobileActiveCard() + this.mobileDragOffset() / this.carouselStep;
    const gap = Home.HOOK_CARD_GAP_PX;
    if (e < 0) {
      const away = Home.clamp01(-e);
      return {
        transform: `translateX(calc(${e} * (100% + ${gap}px)))`,
        opacity: String(1 - Math.max(0, away - 0.85) / 0.15),
        'z-index': '60',
      };
    }
    const depth = Math.min(e, 3);
    return {
      transform: `translateX(${depth * Home.HOOK_STACK_PEEK_PX}px) scale(${1 - depth * Home.HOOK_STACK_SHRINK})`,
      opacity: String(e > 2 ? Math.max(0, 3 - e) : 1),
      'z-index': String(Math.round(50 - e * 10)),
    };
  }

  protected onCarouselKeydown(event: KeyboardEvent): void {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) {
      return;
    }
    event.preventDefault();
    this.hookHintDismissed.set(true);
    this.goToCard(this.mobileActiveCard() + step);
  }

  private goToCard(index: number): void {
    this.resetCardCopy();
    this.mobileActiveCard.set(Math.max(0, Math.min(this.hookPoints.length - 1, index)));
  }

  private readonly carouselTrack = viewChild<ElementRef<HTMLElement>>('carouselTrack');
  private carouselPointerId: number | null = null;
  private carouselStartX = 0;
  private carouselLastX = 0;
  private carouselLastTime = 0;
  private carouselVelocity = 0;

  /** Fraction of the track's own width a drag must cross to commit to the next/previous card instead of springing back. */
  private static readonly HOOK_SWIPE_COMMIT_FRACTION = 0.22;
  /** A fast flick commits even under that distance threshold — px/ms. */
  private static readonly HOOK_SWIPE_VELOCITY_COMMIT = 0.5;
  /** Dragging past the first/last card still "gives" a little instead of stopping dead. */
  private static readonly HOOK_RUBBER_BAND_FACTOR = 0.35;
  /** Finger travel under this (px) counts as a tap rather than a swipe. */
  private static readonly HOOK_TAP_MAX_MOVE_PX = 8;
  /** A tap in the left this-fraction of the stack goes back a card; the rest goes forward. */
  private static readonly HOOK_TAP_BACK_ZONE = 0.3;

  protected onCarouselPointerDown(event: PointerEvent): void {
    // Let the "Read more" button receive its own click instead of being swallowed as a card tap.
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.carouselPointerId = event.pointerId;
    this.isCarouselDragging.set(true);
    this.carouselStartX = event.clientX;
    this.carouselLastX = event.clientX;
    this.carouselLastTime = performance.now();
    this.carouselVelocity = 0;
    this.mobileDragOffset.set(0);
    this.hookHintDismissed.set(true);
    const card = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.hook-card');
    this.carouselStep = (card?.offsetWidth ?? 300) + Home.HOOK_CARD_GAP_PX;
  }

  protected onCarouselPointerMove(event: PointerEvent): void {
    if (this.carouselPointerId !== event.pointerId) {
      return;
    }
    const now = performance.now();
    const dt = Math.max(1, now - this.carouselLastTime);
    this.carouselVelocity = (event.clientX - this.carouselLastX) / dt;
    this.carouselLastX = event.clientX;
    this.carouselLastTime = now;

    let dx = event.clientX - this.carouselStartX;
    const count = this.hookPoints.length;
    const index = this.mobileActiveCard();
    if ((index === 0 && dx > 0) || (index === count - 1 && dx < 0)) {
      dx *= Home.HOOK_RUBBER_BAND_FACTOR;
    }
    this.mobileDragOffset.set(dx);
  }

  protected onCarouselPointerUp(event: PointerEvent): void {
    if (this.carouselPointerId !== event.pointerId) {
      return;
    }
    this.carouselPointerId = null;
    this.isCarouselDragging.set(false);

    const width = this.carouselTrack()?.nativeElement.clientWidth || window.innerWidth;
    const dx = this.mobileDragOffset();
    const commitDistance = width * Home.HOOK_SWIPE_COMMIT_FRACTION;
    const count = this.hookPoints.length;
    const index = this.mobileActiveCard();

    let next = index;
    if (event.type === 'pointercancel') {
      // The browser took the gesture (e.g. a vertical page scroll) — spring back.
    } else if (Math.abs(dx) < Home.HOOK_TAP_MAX_MOVE_PX) {
      // A tap, not a swipe: left side steps back, anywhere else steps forward.
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const fromLeft = (event.clientX - rect.left) / rect.width;
      next = Math.max(0, Math.min(count - 1, index + (fromLeft < Home.HOOK_TAP_BACK_ZONE ? -1 : 1)));
    } else if (dx <= -commitDistance || this.carouselVelocity <= -Home.HOOK_SWIPE_VELOCITY_COMMIT) {
      next = Math.min(count - 1, index + 1);
    } else if (dx >= commitDistance || this.carouselVelocity >= Home.HOOK_SWIPE_VELOCITY_COMMIT) {
      next = Math.max(0, index - 1);
    }

    if (next !== index) {
      this.resetCardCopy();
    }
    this.mobileActiveCard.set(next);
    this.mobileDragOffset.set(0);
  }

  /**
   * The pill below the cards — a small, single filled bar (not dots), like a
   * loading bar: empty at card 1, full at the last card. It's draggable too:
   * tap anywhere to jump proportionally, or drag for the fill to track your
   * finger continuously while the carousel snaps card-by-card underneath it.
   */
  protected readonly isPillDragging = signal(false);
  private readonly pillDragFraction = signal<number | null>(null);
  private pillPointerId: number | null = null;

  protected readonly pillFillPercent = computed(() => {
    const count = this.hookPoints.length;
    if (count <= 1) {
      return 100;
    }
    const dragFraction = this.pillDragFraction();
    return (dragFraction ?? this.mobileActiveCard() / (count - 1)) * 100;
  });

  protected onPillPointerDown(event: PointerEvent): void {
    const track = event.currentTarget as HTMLElement;
    track.setPointerCapture(event.pointerId);
    this.pillPointerId = event.pointerId;
    this.isPillDragging.set(true);
    this.scrubPillToPointer(event, track);
  }

  protected onPillPointerMove(event: PointerEvent): void {
    if (this.pillPointerId !== event.pointerId) {
      return;
    }
    this.scrubPillToPointer(event, event.currentTarget as HTMLElement);
  }

  protected onPillPointerUp(event: PointerEvent): void {
    if (this.pillPointerId !== event.pointerId) {
      return;
    }
    this.pillPointerId = null;
    this.isPillDragging.set(false);
    this.pillDragFraction.set(null);
  }

  private scrubPillToPointer(event: PointerEvent, track: HTMLElement): void {
    const rect = track.getBoundingClientRect();
    const fraction = Home.clamp01((event.clientX - rect.left) / rect.width);
    this.pillDragFraction.set(fraction);
    const count = this.hookPoints.length;
    const target = Math.round(fraction * (count - 1));
    if (target !== this.mobileActiveCard()) {
      this.resetCardCopy();
    }
    this.mobileActiveCard.set(target);
  }

  /**
   * Off by default — a hardcoded switch, not a user preference, so turning
   * gentle auto-advance on later is a one-line flip rather than new work.
   * Paused automatically while the reader's finger is actually on the
   * carousel or the pill.
   */
  private static readonly HOOK_MOBILE_AUTOPLAY_ENABLED = false;
  private static readonly HOOK_MOBILE_AUTOPLAY_INTERVAL_MS = 4200;
  private mobileAutoplayTimer: ReturnType<typeof setInterval> | undefined;

  private setupMobileAutoplay(): void {
    if (!Home.HOOK_MOBILE_AUTOPLAY_ENABLED) {
      return;
    }
    this.mobileAutoplayTimer = setInterval(() => {
      if (this.hookHorizontal() || this.isCarouselDragging() || this.isPillDragging()) {
        return;
      }
      const count = this.hookPoints.length;
      this.mobileActiveCard.update((i) => (i + 1) % count);
    }, Home.HOOK_MOBILE_AUTOPLAY_INTERVAL_MS);
  }

  /**
   * As the reader leaves the hero, the gut illustration simply dims out
   * (no separate minimized icon to manage) and the booking button hands off
   * to the app-chrome's copy — continuously cross-fading against scroll
   * position (via BookingCtaService) rather than snapping in at a
   * threshold, so the handoff reads as one button "arriving" in the corner
   * instead of two buttons swapping.
   */
  private readonly heroSection = viewChild<ElementRef<HTMLElement>>('heroSection');
  private readonly heroExitProgress = signal(0);

  /**
   * Fades across the ENTIRE hero exit (not just the first 70% of it) so the
   * gut illustration is still visibly dimming right up to the moment the
   * hook's pin takes over and its heading appears — no scroll stretch where
   * both are gone and the screen just shows blank canvas in between.
   */
  protected readonly heroGutOpacity = computed(() => 1 - Home.clamp01(this.heroExitProgress()));

  private static clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private static clampSigned(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private static easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  /**
   * The closing line fills in word by word as it scrolls up through the
   * middle of the viewport — muted ink brightening to full oxblood, rather
   * than a plain fade-in. `closeFillProgress` is 0 while the line's top is
   * still low in the viewport and 1 once it has scrolled up near the top.
   * Each word's fill is a continuous 0..1 value (not a hard on/off flip) —
   * recomputed every scroll frame and bound straight to a CSS custom
   * property, so the color genuinely sweeps across the sentence instead of
   * snapping word by word. WORD_FILL_SPAN > one word's share of the
   * sentence, so adjacent words overlap mid-transition rather than each
   * one completing before the next starts.
   */
  private static readonly WORD_FILL_SPAN = 1.6;

  protected readonly hookCloseWords = 'Underneath, fewer things are actually going on than it feels like.'.split(' ');

  private readonly closeQuote = viewChild<ElementRef<HTMLElement>>('closeQuote');
  private readonly closeFillProgress = signal(0);

  protected closeWordFill(index: number): number {
    const n = this.hookCloseWords.length;
    const span = Home.WORD_FILL_SPAN / n;
    const start = (index / n) * (1 - span) ;
    return Home.clamp01((this.closeFillProgress() - start) / span);
  }

  private updateCloseFill(): void {
    const el = this.closeQuote()?.nativeElement;
    if (!el) {
      this.closeFillProgress.set(0);
      return;
    }
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.85;
    const end = vh * 0.4;
    this.closeFillProgress.set(Home.clamp01((start - rect.top) / (start - end)));
  }

  /**
   * Mobile heading reveal — a plain IntersectionObserver fade-in (the old
   * appScrollReveal directive) snaps on at a fixed trigger point and then
   * runs on its own fixed-duration timer, independent of how fast the
   * reader is actually scrolling — which is exactly what read as abrupt.
   * This instead recomputes every scroll frame from the heading's own
   * position, the same way updateCloseFill already does for the closing
   * quote, so the reveal is genuinely tied 1:1 to the scroll gesture.
   */
  private readonly mobileHookHeading = viewChild<ElementRef<HTMLElement>>('mobileHookHeading');
  protected readonly mobileHeadingRevealProgress = signal(0);

  private updateMobileHeadingReveal(): void {
    const el = this.mobileHookHeading()?.nativeElement;
    if (!el) {
      this.mobileHeadingRevealProgress.set(0);
      return;
    }
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.92;
    const end = vh * 0.6;
    this.mobileHeadingRevealProgress.set(Home.easeOutQuad(Home.clamp01((start - rect.top) / (start - end))));
  }

  ngAfterViewInit(): void {
    const update = () => {
      this.updateHookScroll();
      this.updateTreatScroll();
      this.updateTreatDesktopScroll();
      this.updateHeroExitProgress();
      this.updateCloseFill();
      this.updateMobileHeadingReveal();
      this.bookingCta.label.set(this.hookProgress() > 0 ? 'Book your slot' : 'Book now');
    };

    const queue = () => {
      if (this.hookRaf) {
        return;
      }
      this.hookRaf = requestAnimationFrame(() => {
        this.hookRaf = 0;
        update();
      });
    };

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    update();
    this.setupMobileAutoplay();

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      cancelAnimationFrame(this.hookRaf);
      clearInterval(this.mobileAutoplayTimer);
      this.bookingCta.visible.set(false);
      this.bookingCta.registerHandler(() => {});
    });
  }

  private updateHeroExitProgress(): void {
    const hero = this.heroSection()?.nativeElement;
    if (!hero || hero.clientHeight === 0) {
      this.heroExitProgress.set(0);
      return;
    }
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
    this.heroExitProgress.set(progress);

    const opacity = Home.clamp01((progress - 0.3) / 0.4);
    this.bookingCta.opacity.set(opacity);
    this.bookingCta.visible.set(opacity > 0);
  }

  private updateHookScroll(): void {
    this.hookHorizontal.set(window.innerWidth >= Home.HOOK_HORIZONTAL_BREAKPOINT);

    const pin = this.hookPin()?.nativeElement;
    if (!pin) {
      this.hookProgress.set(0);
      this.hookEntryProgress.set(0);
      return;
    }

    const rect = pin.getBoundingClientRect();
    // documentElement.clientHeight (not window.innerHeight) to match the
    // svh unit the pin/viewport are sized in — on mobile, innerHeight shifts
    // as the browser chrome shows/hides mid-scroll, which drifted out of
    // sync with where `position: sticky` actually releases, releasing the
    // pin early and skipping the last card's hold.
    const viewportHeight = document.documentElement.clientHeight;

    this.hookEntryProgress.set(Home.clamp01((viewportHeight - rect.top) / viewportHeight));

    const scrollable = rect.height - viewportHeight;
    if (scrollable <= 0) {
      this.hookProgress.set(0);
      return;
    }

    const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
    this.hookProgress.set(scrolled / scrollable);
  }

  protected readonly hookPoints: readonly HookPoint[] = [
    {
      title: 'What is functional medicine?',
      body: 'The functional nutrition approach is based on using food as medicine and nutrient supplements as a line of treatment for dysfunctions and diseases. Adding required nutrition helps the body to recover, reverse, and put certain diseases into remission.',
      more: "The functional nutrition approach is based on using food as medicine and nutrient supplements as a line of treatment for dysfunctions and diseases. Adding required nutrition helps the body to recover, reverse, and put certain diseases into remission. If a plant or tree isn't flourishing, we nourish the roots, not the leaves. In the same way, to heal the disease, we at FM look for what is causing the Dis-ease.",
      icon: 'root',
      image: 'images/hook/root-cause.png',
      imageAlt: 'A plant with leafy growth above the soil line and a deep, branching root system below it.',
    },
    {
      title: 'What you will not get from an AI chat',
      body: "AI gives generic answers. It can't read your history, labs and symptoms like a clinician actually looking at you can.",
      icon: 'ai',
      image: 'images/hook/ai-chat.png',
      imageAlt: 'A clinician studying a patient chart closely, with a generic chat-bubble icon faded in the background.',
    },
    {
      title: 'Why root-cause healing?',
      body: 'Conventional care asks "what stops this now?" Root-cause care asks "why did this start?" That\'s why it doesn\'t come back.',
      icon: 'balance',
      image: 'images/hook/root-cause-balance.png',
      imageAlt: 'A balanced scale weighing a pill against a sprouting plant.',
    },
    {
      title: 'Why not just another consultation?',
      body: "A 10–15 minute appointment treats the symptom, with no time to ask why it showed up. That's the gap root-cause care closes.",
      icon: 'doctor',
      image: 'images/hook/short-consultation.png',
      imageAlt: 'An hourglass running low next to an empty chair at a desk, suggesting a rushed, too-short appointment.',
    },
  ];

  protected readonly rootCauses: readonly RootCause[] = [
    {
      name: 'Gut imbalance',
      symptoms: 'Bloating · skin flare-ups · brain fog',
      description: 'The single most common thread. Six of seven everyday complaints trace back through digestion.',
    },
    {
      name: 'Blood-sugar swings',
      symptoms: 'Fatigue · poor sleep · cravings',
      description: 'Energy that crashes by 4pm is rarely about willpower — it is often about what and when you eat.',
    },
    {
      name: 'Hormone imbalance',
      symptoms: 'Cycle changes · low mood',
      description: 'Hormones are cleared through the gut. When digestion is under strain, hormonal symptoms often follow.',
    },
    {
      name: 'Chronic stress response',
      symptoms: 'Sleep · mood · digestion',
      description: 'A nervous system stuck in overdrive keeps digestion, sleep and mood locked in the same holding pattern.',
    },
  ];

  protected readonly levels: readonly Level[] = [
    {
      tag: 'Step 1',
      name: 'One-time consultation',
      price: '₹499',
      priceNote: '30 minutes · ₹599 to be confirmed',
      ctaLabel: 'Book a Consultation',
      features: [
        'We listen to your concerns, history and health goals',
        'We explain what may be behind your dis-ease, in plain words',
        'We suggest the tests and supplements that make sense for you',
        'You leave with a simple anti-inflammatory food plan and starting supplement guidance',
      ],
    },
    {
      tag: 'Digest with Ease',
      name: 'Digest with Ease',
      price: 'Scope, duration & price to be confirmed',
      ctaLabel: 'Book This Program',
      description: 'Guided support if your main concern starts in digestion: bloating, acidity, irregular bowels, food sensitivities.',
    },
    {
      tag: 'Transform with Ease',
      name: 'Transform with Ease',
      price: 'Scope, duration & price to be confirmed',
      ctaLabel: 'Book This Program',
      description: 'Whole-person support if your symptoms show up in many places: skin, hormones, energy, sleep, mood, weight.',
    },
  ];

  protected readonly team: readonly TeamMember[] = [
    {
      name: 'Dr. Akshai Kolagani',
      role: 'Clinical Expert',
      credential: 'Bio and credentials pending founder confirmation',
      initials: 'AK',
      bio: 'Reviews every programme for clinical soundness before it reaches a client.',
      ctaLabel: 'Talk to Dr. Akshai',
    },
    {
      name: 'Carol',
      role: 'Founding Expert',
      credential: 'Credentials pending founder confirmation',
      initials: 'C',
      bio: 'Leads the practice side of Ease Disease — how the programme actually runs, week to week.',
      ctaLabel: 'Connect with Carol',
    },
    {
      name: 'Deepa',
      role: 'Founding Expert',
      credential: 'Credentials pending founder confirmation',
      initials: 'D',
      bio: 'Brings the functional-nutrition framework the practice is built on.',
      ctaLabel: 'Connect with Deepa',
    },
  ];
}
