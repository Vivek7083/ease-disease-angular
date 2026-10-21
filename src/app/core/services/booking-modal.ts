import { Service, signal } from '@angular/core';

/**
 * Opens and closes the on-site booking form (app-booking-form, mounted once in
 * the app shell). Every "Book now" / "Book a consultation" button calls open().
 */
@Service()
export class BookingModalService {
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
