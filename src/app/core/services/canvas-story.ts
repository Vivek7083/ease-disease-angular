import { DestroyRef, Injectable, NgZone, inject, signal } from '@angular/core';

export interface CanvasStop {
  element: HTMLElement;
  from: string;
  to: string;
}

/**
 * Drives the single fixed background canvas. Sections register their color
 * stops; as the reader scrolls, the canvas blends smoothly from one stop to
 * the next in oklab so the story never feels like it changes "section".
 */
@Injectable({
  providedIn: 'root',
})
export class CanvasStoryService {
  private readonly zone = inject(NgZone);
  private readonly stops: CanvasStop[] = [];
  private ticking = false;
  private reducedMotion = false;
  private started = false;

  readonly canvasColor = signal('var(--ivory)');

  registerStop(stop: CanvasStop): void {
    this.stops.push(stop);
    this.stops.sort((a, b) => {
      const position = a.element.compareDocumentPosition(b.element);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }

  start(destroyRef: DestroyRef): void {
    if (this.started || typeof window === 'undefined') {
      return;
    }
    this.started = true;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onScroll = () => {
      if (this.ticking) {
        return;
      }
      this.ticking = true;
      requestAnimationFrame(() => {
        this.recompute();
        this.ticking = false;
      });
    };

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    });

    destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    });

    this.recompute();
  }

  private recompute(): void {
    if (this.stops.length === 0) {
      return;
    }
    const vh = window.innerHeight;
    let color = this.stops[0].from;

    for (const stop of this.stops) {
      const rect = stop.element.getBoundingClientRect();
      // Blend only across the boundary — one viewport height of scroll (or the
      // section's own height, if shorter). A section can be arbitrarily tall
      // (e.g. a pinned scrollytelling track) without dragging out its color
      // transition or stalling the next section's; the canvas always finishes
      // blending by the time a section's top has scrolled to the viewport top.
      const span = Math.max(1, Math.min(vh, rect.height));
      const progressRaw = span > 0 ? (vh - rect.top) / span : 0;
      const progress = this.reducedMotion
        ? Math.round(Math.max(0, Math.min(1, progressRaw)))
        : Math.max(0, Math.min(1, progressRaw));

      if (progress <= 0) {
        break;
      }
      color = `color-mix(in oklab, ${stop.to} ${(progress * 100).toFixed(1)}%, ${stop.from})`;
      if (progress < 1) {
        break;
      }
    }

    this.zone.run(() => this.canvasColor.set(color));
  }
}
