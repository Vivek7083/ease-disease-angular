import { AfterViewInit, Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { CanvasStopDirective } from '../../core/directives/canvas-stop';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal';
import { BookingCtaService } from '../../core/services/booking-cta';
import { Wordmark } from '../../shared/components/wordmark/wordmark';
import { CtaPill } from '../../shared/components/cta-pill/cta-pill';
import { EyebrowLabel } from '../../shared/components/eyebrow-label/eyebrow-label';
import { EvidenceTick } from '../../shared/components/evidence-tick/evidence-tick';
import { GutHub } from '../../shared/components/gut-hub/gut-hub';
import { LevelCard, type Level } from '../../shared/components/level-card/level-card';
import { TeamCard, type TeamMember } from '../../shared/components/team-card/team-card';
import { RootMap } from '../../shared/components/root-map/root-map';

interface RootCause {
  readonly name: string;
  readonly symptoms: string;
  readonly description: string;
}

interface HookPoint {
  readonly title: string;
  readonly body: string;
  readonly icon: 'doctor' | 'root' | 'ai' | 'balance';
}

@Component({
  selector: 'app-home',
  imports: [CanvasStopDirective, ScrollRevealDirective, Wordmark, CtaPill, EyebrowLabel, EvidenceTick, GutHub, LevelCard, TeamCard, RootMap],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly bookingCta = inject(BookingCtaService);

  /** Descent, levels, team and close are being redesigned next — hero and the hook are live. */
  protected readonly showRemainingSections = false;

  constructor() {
    this.bookingCta.registerHandler(() => this.bookConsultation());
  }

  protected bookConsultation(): void {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  /**
   * The scrubber only makes sense while there's a card on screen to scrub
   * through — it fades in alongside the cards themselves and fades back
   * out again as the last card finishes its own exit, rather than sitting
   * there once the cards are gone.
   */
  protected readonly scrubberVisibility = computed(() => this.cardsOpacity() * (1 - Home.clamp01((this.cardsPhaseProgress() - 0.94) / 0.06)));
  /**
   * Desktop only: card 1 arrives fully visible and then holds still for
   * this opening slice of pinned scroll before the track starts panning —
   * the same "real reading time" the mobile stack already gives every card
   * via CARD_DWELL. Without it, dragging began on the very first pixel of
   * pinned scroll and card 1 never got a moment to actually be read.
   */
  private static readonly HOOK_HORIZONTAL_LEAD_DWELL = 0.1;
  protected readonly hookDragProgress = computed(() => {
    if (!this.hookHorizontal()) {
      return Math.min(1, this.cardsPhaseProgress() / Home.HOOK_DRAG_PHASE);
    }
    const lead = Home.HOOK_HORIZONTAL_LEAD_DWELL;
    return Home.clamp01((this.cardsPhaseProgress() - lead) / (Home.HOOK_DRAG_PHASE - lead));
  });

  /**
   * Raw drag progress panned linearly the whole way, so a card was never
   * actually still — it was always mid-transition into the next one, which
   * read as "I can't finish reading before the next card shows up". Only
   * this fraction of each card's own unit of drag is spent actually
   * panning/revealing; the rest holds the arrived card flat in place (a
   * real reading window) before the next one starts sliding in. Mirrors the
   * mobile stack's CARD_DWELL, just expressed per unit of continuous drag
   * instead of per discrete card turn.
   */
  private static readonly HOOK_TRANSITION_FRACTION = 0.55;

  private mapWithDwell(t: number): number {
    const whole = Math.floor(t);
    const frac = t - whole;
    const eased = Math.min(1, frac / Home.HOOK_TRANSITION_FRACTION);
    return Math.min(this.hookPoints.length - 1, whole + eased);
  }

  /** Continuous 0..(count-1) position along the desktop drag, before the per-card dwell is applied. */
  protected readonly hookDragUnits = computed(() => this.hookDragProgress() * (this.hookPoints.length - 1));

  /** Same range as hookDragUnits, but each card holds still for its dwell share before the next one moves. */
  protected readonly hookEffectiveUnits = computed(() => this.mapWithDwell(this.hookDragUnits()));

  protected readonly hookActiveIndex = computed(() => {
    const count = this.hookPoints.length;
    return this.hookHorizontal() ? Math.round(this.hookEffectiveUnits()) : Math.min(count - 1, Math.floor(this.cardsPhaseProgress() * count));
  });
  protected readonly hookTrackOffset = computed(() => -this.hookEffectiveUnits() * window.innerWidth);

  /**
   * Mobile cards render as a physical stack — the active card on top,
   * the rest peeking out behind it — rather than crossfading in place.
   * continuousCardIndex is a smooth (non-floored) version of "which card
   * are we on", so a card's depth relative to it can pass smoothly through
   * fractional values as the reader scrolls, instead of snapping between
   * two fixed states.
   */
  protected readonly continuousCardIndex = computed(() => this.cardsPhaseProgress() * this.hookPoints.length);

  /**
   * Cards 2+ visibly slide in from off-stage (behind the stack, or off the
   * right edge of the horizontal track) the moment they become active — but
   * card 1 starts the sequence already sitting at rest, since there's
   * nothing before it to reveal it from. That read as it "appearing out of
   * nowhere". This gives it the same from-the-right entrance as the rest —
   * driven by hookEntryProgress (the same signal the heading's typewriter
   * uses), not cardsOpacity/hookProgress, which only start once the pin is
   * fully stuck: syncing to those left a dead beat after the heading
   * finished typing, then an abrupt, separate pop-in. This way card 1
   * arrives continuously alongside the heading and is already in place the
   * moment typing finishes.
   */
  private static readonly FIRST_CARD_ENTRANCE_TRAVEL = 90;
  protected readonly firstCardEntrance = computed(() => 1 - this.headingRevealProgress());

  /**
   * Desktop only: each card's own info column reveals left-to-right as it
   * slides in — the same clip-path wipe the heading uses for its typewriter
   * reveal, so a card arriving mid-scroll isn't just a solid block sliding
   * into place with its text already fully drawn. Card 1 has no drag
   * transition to key off (it's already at rest at drag 0), so it reuses
   * hookEntryProgress — the same signal driving its slide-in and the
   * heading's own reveal. Cards 2+ key off their own slice of the
   * continuous drag: 0 right as the previous card starts giving way, 1 once
   * this one has fully arrived.
   */
  protected cardInfoReveal(i: number): number {
    if (i === 0) {
      return this.headingRevealProgress();
    }
    return Home.clamp01(this.hookEffectiveUnits() - (i - 1));
  }

  protected cardInfoClipPath(i: number): string {
    const reveal = this.cardInfoReveal(i);
    return `inset(0 0 0 ${(1 - reveal) * 100}%)`;
  }

  /** i's position in the stack: 0 = on top, 1 = next one back, negative = already peeled off. */
  protected cardDepth(i: number): number {
    return i - this.continuousCardIndex();
  }

/**
   * Each card's own turn (once it's on top) splits into a still DWELL —
   * the "viewing scroll space" where scrolling doesn't move the card at
   * all, so the reader gets real room to read it — followed by a short,
   * abrupt EXIT once they keep scrolling past that. A continuous slide the
   * whole way (the previous version) never actually gave the card a
   * moment to just sit still and be read.
   */
  private static readonly CARD_DWELL = 0.66;

  /** How far (px) and how much the card shrinks over the abrupt exit — a quick flick left, not a slow drift. */
  private static readonly CARD_EXIT_TRAVEL = 420;
  private static readonly CARD_EXIT_SHRINK = 0.08;

  /**
   * 0 the instant a card arrives on top, 1 once it has fully exited —
   * clamped, since further scrolling after a card is long gone shouldn't
   * keep changing a number nothing reads visually anymore.
   */
  private cardTurnProgress(i: number): number {
    return Home.clamp01(-this.cardDepth(i));
  }

  /**
   * depth > 0: still waiting in the stack — nudged down and scaled
   * slightly smaller the further back it sits, like a real stack of cards
   * seen from above.
   * depth <= 0: this card has had its turn. For the first CARD_DWELL share
   * of that turn it sits perfectly still (the reading window); only past
   * that does it flick left and shrink slightly on its way out — abrupt
   * because it happens over the remaining, smaller share of the turn, not
   * the whole thing.
   */
  protected cardTransform(i: number): string | null {
    const entrance = i === 0 ? this.firstCardEntrance() : 0;

    if (this.hookHorizontal()) {
      // Full-width slide, same as every later card sliding in off the right
      // edge of the track as it pans — a fixed px nudge (the mobile
      // treatment) read as far too small a motion on a full 100vw slide.
      return entrance > 0 ? `translateX(${entrance * 100}%)` : null;
    }

    const entranceTransform = entrance > 0 ? `translateX(${entrance * Home.FIRST_CARD_ENTRANCE_TRAVEL}px)` : '';

    const depth = this.cardDepth(i);
    if (depth > 0) {
      const behind = Math.min(depth, 3);
      return `translateY(${behind * 16}px) scale(${1 - behind * 0.045}) ${entranceTransform}`.trim();
    }
    const turn = this.cardTurnProgress(i);
    if (turn <= Home.CARD_DWELL) {
      return entranceTransform || 'none';
    }
    const exit = (turn - Home.CARD_DWELL) / (1 - Home.CARD_DWELL);
    return `translateX(${-exit * Home.CARD_EXIT_TRAVEL}px) scale(${1 - exit * Home.CARD_EXIT_SHRINK})`;
  }

  /**
   * Fully opaque through the entire dwell (reading window) — it only
   * starts fading once it's already flicking away to the left during its
   * own abrupt exit, so nothing ever reads as "see-through" while it's
   * sitting still and being read.
   */
  protected cardOpacity(i: number): number {
    const depth = this.cardDepth(i);
    if (depth > 0) {
      return 1;
    }
    const turn = this.cardTurnProgress(i);
    if (turn <= Home.CARD_DWELL) {
      return 1;
    }
    const exit = (turn - Home.CARD_DWELL) / (1 - Home.CARD_DWELL);
    return 1 - exit;
  }

  /** The card mid-exit needs to stay above the one it's revealing while both are visible. */
  protected cardZIndex(i: number): number {
    return Math.round(1000 - this.cardDepth(i) * 10);
  }

  /** 0..1 across the whole card sequence — what the scrubber's own small fill tracks. */
  protected readonly scrubberProgress = computed(() => this.cardsPhaseProgress());

  private scrubbing = false;

  protected onScrubberPointerDown(event: PointerEvent): void {
    const track = event.currentTarget as HTMLElement;
    track.setPointerCapture(event.pointerId);
    this.scrubbing = true;
    this.scrubToPointer(event, track);
  }

  protected onScrubberPointerMove(event: PointerEvent): void {
    if (!this.scrubbing) {
      return;
    }
    this.scrubToPointer(event, event.currentTarget as HTMLElement);
  }

  protected onScrubberPointerUp(): void {
    this.scrubbing = false;
  }

  /**
   * Converts a pointer's horizontal position on the scrubber directly into
   * a scroll position — reverses the same math updateHookScroll reads
   * scroll position with, so dragging the bar and scrolling the page drive
   * the exact same underlying progress value. Not smooth-scrolled: during
   * a drag the reader's finger IS the animation, so the scroll should track
   * it 1:1 rather than chase it.
   */
  private scrubToPointer(event: PointerEvent, track: HTMLElement): void {
    const pin = this.hookPin()?.nativeElement;
    if (!pin) {
      return;
    }
    const viewportHeight = document.documentElement.clientHeight;
    const rect = pin.getBoundingClientRect();
    const scrollable = rect.height - viewportHeight;
    if (scrollable <= 0) {
      return;
    }
    const trackRect = track.getBoundingClientRect();
    const fraction = Home.clamp01((event.clientX - trackRect.left) / trackRect.width);
    const targetHookProgress = Home.HEADING_REVEAL_PHASE + fraction * (1 - Home.HEADING_REVEAL_PHASE);
    const pinDocumentTop = rect.top + window.scrollY;
    window.scrollTo({ top: pinDocumentTop + Home.clamp01(targetHookProgress) * scrollable });
  }

  /**
   * A horizontal drag on the top card drives it exactly the way scrolling
   * already does — it just converts left/right finger movement into the
   * equivalent vertical scroll delta, rather than being a separate,
   * parallel animation. Swipe left (finger moves left) advances forward,
   * matching the direction the card itself flicks away on exit.
   */
  private static readonly CARD_SWIPE_DISTANCE_PER_CARD = 160;

  private cardSwiping = false;
  private cardSwipeStartX = 0;
  private cardSwipeStartScrollY = 0;

  protected onCardSwipeStart(event: PointerEvent): void {
    if (this.hookHorizontal()) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.cardSwiping = true;
    this.cardSwipeStartX = event.clientX;
    this.cardSwipeStartScrollY = window.scrollY;
  }

  protected onCardSwipeMove(event: PointerEvent): void {
    if (!this.cardSwiping) {
      return;
    }
    const pin = this.hookPin()?.nativeElement;
    if (!pin) {
      return;
    }
    const viewportHeight = document.documentElement.clientHeight;
    const scrollable = pin.getBoundingClientRect().height - viewportHeight;
    if (scrollable <= 0) {
      return;
    }
    const count = this.hookPoints.length;
    const cardSegmentPx = (scrollable * (1 - Home.HEADING_REVEAL_PHASE)) / count;
    const pxPerDragPx = cardSegmentPx / Home.CARD_SWIPE_DISTANCE_PER_CARD;
    const dx = event.clientX - this.cardSwipeStartX;
    window.scrollTo({ top: this.cardSwipeStartScrollY - dx * pxPerDragPx });
  }

  protected onCardSwipeEnd(): void {
    this.cardSwiping = false;
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
  protected readonly heroCtaOpacity = computed(() => 1 - Home.clamp01(this.heroExitProgress() / 0.45));

  private static clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
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

  ngAfterViewInit(): void {
    const update = () => {
      this.updateHookScroll();
      this.updateHeroExitProgress();
      this.updateCloseFill();
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

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      cancelAnimationFrame(this.hookRaf);
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
      title: 'What your doctors will not tell you',
      body: "A 10-minute visit is built to treat what's in front of them, not to ask why it's there in the first place. That question is where root-cause work starts.",
      icon: 'doctor',
    },
    {
      title: 'Conventional care vs. root-cause care',
      body: 'Conventional care quiets the symptom. Root-cause care asks what is producing it — and treats that instead.',
      icon: 'root',
    },
    {
      title: 'What you will not get from an AI chat',
      body: 'A generic chatbot can describe a condition. It cannot read your bloodwork, your history and your life against each other the way a trained practitioner can.',
      icon: 'ai',
    },
    {
      title: 'Root-cause treatment vs. symptom management',
      body: 'Root-cause treatment goes after what is driving the pattern. Symptom management just quiets it down. Once you see the difference, the rest of this page will make a lot more sense.',
      icon: 'balance',
    },
  ];

  protected readonly programmeIncludes: readonly string[] = [
    'Your complaints, concerns, medical history and health goals',
    'What could be driving it — your likely underlying cause(s)',
    'Recommended tests and supplements to start with',
    'A basic anti-inflammatory diet, and where your diet or lifestyle is going wrong',
    'Simple supplement guidance — magnesium, vitamin D3',
    'Why healing begins with improving digestion',
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
      tag: 'Level 01',
      name: 'First consultation',
      price: '₹499',
      priceNote: '30 minutes · one time',
      features: ['A full conversation about your history', 'A first look at where your pattern may start', 'A clear next step, no obligation'],
    },
    {
      tag: 'Level 02–04',
      name: 'Root-cause programme',
      price: 'Coming after your call',
      features: ['Built around what your first consultation finds', 'Ongoing check-ins with your practitioner', 'Adjusted as your body responds'],
    },
    {
      tag: 'E.A.S.E. DIS-EASE',
      name: '3-month lifestyle programme',
      price: '₹15,999',
      priceNote: '≈ ₹5,333 / month',
      recommended: true,
      features: ['Ongoing consults & check-ins', 'Blood report reviews', 'Mental & emotional support', 'Reviewed by Dr. Akshai'],
    },
  ];

  protected readonly team: readonly TeamMember[] = [
    { name: 'Carol', role: 'Co-founder', initials: 'C', bio: 'Leads the practice side of Ease Disease — how the programme actually runs, week to week.' },
    { name: 'Deepa', role: 'Co-founder', initials: 'D', bio: 'Brings the functional-nutrition framework the practice is built on.' },
    { name: 'Dr. Akshai Kolagani', role: 'Clinical reviewer', initials: 'AK', bio: 'Reviews every programme for clinical soundness before it reaches a client.' },
  ];
}
