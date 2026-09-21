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

  readonly revealed = signal(false);

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
              setTimeout(() => this.revealed.set(true), delay);
            } else {
              this.revealed.set(true);
            }
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(this.elementRef.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
