import { AfterViewInit, Directive, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';

/**
 * Fades an element up into place the first time it crosses into the
 * viewport. Pair with the `.reveal` utility class (styles.scss) for the
 * hidden/shown states; this directive only toggles `.is-visible`.
 */
@Directive({
  selector: '[appScrollReveal]',
  host: {
    '[class.is-visible]': 'revealed()',
  },
})
export class ScrollRevealDirective implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly revealDelay = input(0, { alias: 'appScrollReveal' });

  /** When true the element hides again once it scrolls out of view and re-reveals on the way back, instead of revealing once and staying put. */
  readonly revealRepeat = input(false);

  readonly revealed = signal(false);

  private pendingReveal: ReturnType<typeof setTimeout> | undefined;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.revealed.set(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const delay = this.revealDelay();
            if (delay > 0) {
              this.pendingReveal = setTimeout(() => this.revealed.set(true), delay);
            } else {
              this.revealed.set(true);
            }
            if (!this.revealRepeat()) {
              observer.unobserve(entry.target);
            }
          } else if (this.revealRepeat()) {
            // Only rewind once the element has left through the BOTTOM edge. The hidden
            // state sits 28px lower, so rewinding an element that just left through the
            // top nudges it back into view, which re-reveals it, which moves it out
            // again — the notes visibly bounced at the top edge. Leaving the top, it
            // simply stays revealed.
            const leftThroughTop = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
            if (!leftThroughTop) {
              clearTimeout(this.pendingReveal);
              this.revealed.set(false);
            }
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(this.elementRef.nativeElement);
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.pendingReveal);
      observer.disconnect();
    });
  }
}
