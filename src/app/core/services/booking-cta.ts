import { Service, signal } from '@angular/core';

/**
 * Bridges the homepage's scroll-driven "mini booking CTA" into the app-level
 * chrome, so it can be laid out as a real flex sibling of the scroll-progress
 * rail (guaranteed no overlap) instead of two independently fixed-position
 * elements guessing each other's geometry.
 */
@Service()
export class BookingCtaService {
  readonly visible = signal(false);
  readonly opacity = signal(0);
  readonly label = signal('Book now');

  private handler: (() => void) | null = null;

  registerHandler(handler: () => void): void {
    this.handler = handler;
  }

  trigger(): void {
    this.handler?.();
  }
}
