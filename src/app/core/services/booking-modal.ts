import { Service, signal } from '@angular/core';

/** `book`: sign in if needed, then the booking form. `sign-in`: just the sign-in step (the navbar's Log in / Sign up). */
export type BookingMode = 'book' | 'sign-in';

/** Survives the trip to the inbox and back (this tab only), so booking can pick up where it left off. */
const BOOK_INTENT_KEY = 'ed-book-intent';

/**
 * Opens and closes the on-site booking dialog (app-booking-form, mounted once in
 * the app shell). Every "Book now" / "Book a consultation" button calls open().
 */
@Service()
export class BookingModalService {
  readonly isOpen = signal(false);
  readonly mode = signal<BookingMode>('book');

  open(mode: BookingMode = 'book'): void {
    this.mode.set(mode);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  /**
   * Called when an email sign-in link is sent from the booking dialog. The link opens a fresh page load, so the dialog
   * is gone; this remembers that the person was booking. Pass false to forget it (a plain log-in is not a booking).
   */
  rememberBookIntent(booking: boolean): void {
    try {
      if (booking) {
        sessionStorage.setItem(BOOK_INTENT_KEY, '1');
      } else {
        sessionStorage.removeItem(BOOK_INTENT_KEY);
      }
    } catch {
      /* blocked storage: they just press Book now again after signing in */
    }
  }

  /** True once if the person was booking when they left for their inbox; the next call returns false. */
  consumeBookIntent(): boolean {
    try {
      const wasBooking = sessionStorage.getItem(BOOK_INTENT_KEY) === '1';
      sessionStorage.removeItem(BOOK_INTENT_KEY);
      return wasBooking;
    } catch {
      return false;
    }
  }
}
