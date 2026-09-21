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

  private readonly hookPin = viewChild<ElementRef<HTMLElement>>('hookPin');
  private readonly hookProgress = signal(0);
  private hookRaf = 0;

  protected readonly hookHorizontal = signal(false);
  protected readonly hookDragProgress = computed(() => Math.min(1, this.hookProgress() / Home.HOOK_DRAG_PHASE));
  protected readonly hookActiveIndex = computed(() => {
    const count = this.hookPoints.length;
    return this.hookHorizontal()
      ? Math.round(this.hookDragProgress() * (count - 1))
      : Math.min(count - 1, Math.floor(this.hookProgress() * count));
  });
  protected readonly hookTrackOffset = computed(() => -this.hookDragProgress() * (this.hookPoints.length - 1) * window.innerWidth);

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

  protected readonly heroGutOpacity = computed(() => 1 - Home.clamp01(this.heroExitProgress() / 0.7));
  protected readonly heroCtaOpacity = computed(() => 1 - Home.clamp01(this.heroExitProgress() / 0.45));

  private static clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
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
      return;
    }

    const rect = pin.getBoundingClientRect();
    // documentElement.clientHeight (not window.innerHeight) to match the
    // svh unit the pin/viewport are sized in — on mobile, innerHeight shifts
    // as the browser chrome shows/hides mid-scroll, which drifted out of
    // sync with where `position: sticky` actually releases, releasing the
    // pin early and skipping the last card's hold.
    const viewportHeight = document.documentElement.clientHeight;
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
      body: 'Conventional care quiets what a symptom is doing right now. Root-cause care asks what is producing it in the first place — and treats that, so the same pattern does not just resurface somewhere else.',
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
