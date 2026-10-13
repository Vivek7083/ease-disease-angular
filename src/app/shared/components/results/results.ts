import { AfterViewInit, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';

interface Outcome {
  readonly title: string;
  readonly body: string;
}

// PRD §4 outcomes, worded as "can" / "many people" rather than guarantees —
// same softening the content doc applies to the remission line. The
// medication line explicitly keeps the doctor in the loop.
const OUTCOMES: readonly Outcome[] = [
  { title: 'Your energy', body: 'Fewer afternoon crashes, more in the tank by evening.' },
  { title: 'Your sleep', body: 'Falling asleep easier, and staying asleep through the night.' },
  { title: 'Your mood', body: 'A steadier baseline and fewer emotional swings.' },
  { title: 'Your hormones', body: 'Cycles that settle, and blood sugar and energy that hold steady.' },
  { title: 'Your confidence', body: 'You understand your body and how to manage stress, so the change lasts.' },
];

@Component({
  selector: 'app-results',
  imports: [ScrollRevealDirective, EyebrowLabel],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  protected readonly outcomes = OUTCOMES;

  /** 0..1 — how far down the list the reader has scrolled; the mobile stem grows to match. */
  protected readonly stemProgress = signal(0);

  ngAfterViewInit(): void {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = this.list()?.nativeElement;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const reach = window.innerHeight * 0.8;
      // Stepped to 1% so the stem isn't re-drawn on sub-pixel scroll changes.
      this.stemProgress.set(Math.round(Math.max(0, Math.min(1, (reach - rect.top) / rect.height)) * 100) / 100);
    };
    const queue = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    update();
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      cancelAnimationFrame(raf);
    });
  }
}
