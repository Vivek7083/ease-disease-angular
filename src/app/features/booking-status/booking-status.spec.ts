import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { afterEach, beforeEach, vi } from 'vitest';
import { ApiError } from '../../core/api/api-error';
import type { BookingDetail, BookingStatus as Status, PaymentStatus } from '../../core/api/api-types';
import { AuthService } from '../../core/services/auth';
import { BookingModalService } from '../../core/services/booking-modal';
import { BookingsService } from '../../core/services/bookings';
import { PaymentService } from '../../core/services/payment';
import { BookingStatus } from './booking-status';

const detail = (status: Status, payment: PaymentStatus | null = 'INITIATED', over: Partial<BookingDetail> = {}): BookingDetail => ({
  reference: 'ED-7K3QXM',
  status,
  packageTitle: 'One-Time Consult',
  amountPaise: 249900,
  currency: 'INR',
  name: 'Priya Sharma',
  whatsappNumber: '+919876543210',
  email: 'priya@example.com',
  age: 34,
  city: 'Pune',
  gender: null,
  notes: null,
  canPay: false,
  payment: payment
    ? { orderId: 'EDTX1', status: payment, mode: 'UPI', paidAt: payment === 'SUCCESS' ? '2026-10-23T19:43:39.094Z' : null }
    : null,
  createdAt: '2026-10-23T19:40:00.000Z',
  ...over,
});

/** Answers get() from a queue, repeating the last answer when the queue runs out. */
class FakeBookings {
  calls = 0;
  answers: (BookingDetail | ApiError)[] = [];
  get(): Observable<BookingDetail> {
    this.calls++;
    const answer = this.answers.length > 1 ? this.answers.shift()! : this.answers[0];
    return answer instanceof ApiError ? throwError(() => answer) : of(answer);
  }
}

class FakeAuth {
  ready = signal(true);
  user = signal<{ email: string; name: string | null } | null>({ email: 'p@example.com', name: 'P' });
  signInOpened = 0;
  openSignIn = () => this.signInOpened++;
}

const fail = (code: string, status: number, retryAfter: number | null = null) => new ApiError(code, 'm', status, 'req-1', {}, retryAfter);

describe('BookingStatus page', () => {
  let bookings: FakeBookings;
  let auth: FakeAuth;
  let paid: string[];
  let modal: BookingModalService;

  const render = async (e?: string) => {
    const fixture = TestBed.createComponent(BookingStatus);
    fixture.componentRef.setInput('reference', 'ED-7K3QXM');
    if (e) fixture.componentRef.setInput('e', e);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    const advance = async (ms: number) => {
      await vi.advanceTimersByTimeAsync(ms);
      fixture.detectChanges();
    };
    return { fixture, root: fixture.nativeElement as HTMLElement, advance };
  };
  const text = (root: HTMLElement) => root.textContent?.replace(/\s+/g, ' ') ?? '';

  beforeEach(() => {
    vi.useFakeTimers();
    bookings = new FakeBookings();
    auth = new FakeAuth();
    paid = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: BookingsService, useValue: bookings },
        { provide: AuthService, useValue: auth },
        { provide: PaymentService, useValue: { startPayment: async (ref: string) => void paid.push(ref) } },
      ],
    });
    modal = TestBed.inject(BookingModalService);
  });

  afterEach(() => vi.useRealTimers());

  it('waits for the sign-in check without asking the API anything', async () => {
    auth.ready.set(false);
    auth.user.set(null);
    const { root } = await render();
    expect(text(root)).toContain('Checking your sign-in');
    expect(bookings.calls).toBe(0);
  });

  it('asks a signed-out visitor to sign in, and asks the API nothing', async () => {
    auth.user.set(null);
    const { root } = await render();
    expect(text(root)).toContain('Sign in to see this booking');
    root.querySelector<HTMLButtonElement>('.btn')!.click();
    expect(auth.signInOpened).toBe(1);
    expect(bookings.calls).toBe(0);
  });

  it('starts as soon as the person signs in', async () => {
    auth.user.set(null);
    bookings.answers = [detail('CONFIRMED', 'SUCCESS')];
    const { fixture, root } = await render();
    auth.user.set({ email: 'p@example.com', name: 'P' });
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(text(root)).toContain("You're booked");
  });

  it('shows a confirmed booking with its details and stops asking', async () => {
    bookings.answers = [detail('CONFIRMED', 'SUCCESS')];
    const { root, advance } = await render();
    const page = text(root);
    expect(page).toContain("You're booked");
    expect(page).toContain('Our experts will contact you on WhatsApp');
    expect(page).toContain('+919876543210');
    expect(page).toContain('ED-7K3QXM');
    expect(page).toContain('₹2499');
    expect(page).toMatch(/Paid\s*24 Oct 2026/);
    await advance(20_000);
    expect(bookings.calls).toBe(1);
  });

  it('shows "confirming" while the payment is undecided, then the result, asking every 2 seconds', async () => {
    bookings.answers = [detail('PENDING_PAYMENT', 'INITIATED'), detail('PENDING_PAYMENT', 'INITIATED'), detail('CONFIRMED', 'SUCCESS')];
    const { root, advance } = await render();
    expect(text(root)).toContain('Confirming your payment');
    await advance(1_999);
    expect(bookings.calls).toBe(1);
    await advance(1);
    expect(bookings.calls).toBe(2);
    expect(text(root)).toContain('Confirming your payment');
    await advance(2_000);
    expect(text(root)).toContain("You're booked");
    await advance(10_000);
    expect(bookings.calls).toBe(3);
  });

  it('after 60 seconds still pending, says it is still confirming and stops asking; Check again asks once more', async () => {
    bookings.answers = [detail('PENDING_PAYMENT', 'INITIATED')];
    const { root, advance } = await render();
    await advance(60_000);
    expect(text(root)).toContain('Still confirming with the bank');
    const callsAtTimeout = bookings.calls;
    await advance(30_000);
    expect(bookings.calls).toBe(callsAtTimeout);

    root.querySelector<HTMLButtonElement>('.btn-quiet')!.click();
    await advance(0);
    expect(bookings.calls).toBeGreaterThan(callsAtTimeout);
    expect(text(root)).toContain('Confirming your payment');
  });

  it('shows the failed screen, and Book again opens the booking dialog', async () => {
    bookings.answers = [detail('FAILED', 'FAILURE')];
    const { root } = await render();
    expect(text(root)).toContain('Payment did not go through');
    root.querySelector<HTMLButtonElement>('.btn')!.click();
    expect(modal.isOpen()).toBe(true);
    expect(modal.mode()).toBe('book');
  });

  it('shows the needs-attention message', async () => {
    bookings.answers = [detail('NEEDS_ATTENTION', 'SUCCESS')];
    const { root } = await render();
    expect(text(root)).toContain('We received your payment and are checking one detail');
  });

  it('says it cannot find a booking that is not there (or not theirs) and stops asking', async () => {
    bookings.answers = [fail('BOOKING_NOT_FOUND', 404)];
    const { root, advance } = await render();
    expect(text(root)).toContain('We cannot find this booking');
    await advance(10_000);
    expect(bookings.calls).toBe(1);
  });

  it('waits as long as the API asks after a rate limit before asking again', async () => {
    bookings.answers = [fail('RATE_LIMITED', 429, 10), detail('CONFIRMED', 'SUCCESS')];
    const { root, advance } = await render();
    expect(bookings.calls).toBe(1);
    await advance(9_000);
    expect(bookings.calls).toBe(1);
    await advance(1_000);
    expect(bookings.calls).toBe(2);
    expect(text(root)).toContain("You're booked");
  });

  it('shows a small notice for the ?e= flag but still asks the API what happened', async () => {
    bookings.answers = [detail('CONFIRMED', 'SUCCESS')];
    const { root } = await render('verify');
    expect(root.querySelector('.notice')?.textContent).toContain('could not verify');
    expect(text(root)).toContain("You're booked");
  });

  it('for a booking whose payment never started, offers Pay (when allowed) instead of pretending to confirm', async () => {
    bookings.answers = [detail('PENDING_PAYMENT', null, { canPay: true })];
    const { root, advance } = await render();
    expect(text(root)).toContain('Waiting for payment');
    expect(text(root)).not.toContain('Confirming');
    await advance(10_000);
    expect(bookings.calls).toBe(1);
    root.querySelector<HTMLButtonElement>('.btn')!.click();
    await advance(0);
    expect(paid).toEqual(['ED-7K3QXM']);
  });

  it('stops asking when the page is left', async () => {
    bookings.answers = [detail('PENDING_PAYMENT', 'INITIATED')];
    const { fixture, advance } = await render();
    const before = bookings.calls;
    fixture.destroy();
    await advance(30_000);
    expect(bookings.calls).toBe(before);
  });
});
