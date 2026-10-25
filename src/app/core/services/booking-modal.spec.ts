import { TestBed } from '@angular/core/testing';
import { BookingModalService } from './booking-modal';

describe('BookingModalService', () => {
  let modal: BookingModalService;

  beforeEach(() => {
    sessionStorage.clear();
    modal = TestBed.inject(BookingModalService);
  });

  it('opens in book mode by default, as every Book now button expects', () => {
    modal.open();
    expect(modal.isOpen()).toBe(true);
    expect(modal.mode()).toBe('book');
  });

  it('opens in sign-in mode for the navbar, and goes back to book mode on the next plain open', () => {
    modal.open('sign-in');
    expect(modal.mode()).toBe('sign-in');
    modal.close();
    expect(modal.isOpen()).toBe(false);
    modal.open();
    expect(modal.mode()).toBe('book');
  });

  it('remembers that the person was booking when they left for their inbox, once', () => {
    modal.rememberBookIntent(true);
    expect(modal.consumeBookIntent()).toBe(true);
    expect(modal.consumeBookIntent()).toBe(false);
  });

  it('forgets a booking intent when a plain log-in link is sent afterwards', () => {
    modal.rememberBookIntent(true);
    modal.rememberBookIntent(false);
    expect(modal.consumeBookIntent()).toBe(false);
  });
});
