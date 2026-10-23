import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ApiError } from '../../core/api/api-error';
import type { BookingList, BookingListItem, BookingStatus } from '../../core/api/api-types';
import type { ListTab } from '../../core/booking/booking-list';
import { AuthService } from '../../core/services/auth';
import { BookingModalService } from '../../core/services/booking-modal';
import { BookingsService } from '../../core/services/bookings';
import { PaymentService } from '../../core/services/payment';
import { MyBookings } from './my-bookings';

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

const item = (reference: string, status: BookingStatus, canPay = false, over: Partial<BookingListItem> = {}): BookingListItem => ({
  reference,
  status,
  packageTitle: 'One-Time Consult',
  amountPaise: 249900,
  paymentStatus: status === 'CONFIRMED' ? 'SUCCESS' : null,
  canPay,
  createdAt: '2026-10-23T19:43:39.094Z',
  ...over,
});

/** Answers list() from a queue per tab, recording each call. */
class FakeBookings {
  calls: { tab: ListTab; cursor: string | null }[] = [];
  pages: Record<ListTab, (BookingList | ApiError)[]> = { active: [], past: [] };
  list(tab: ListTab, cursor: string | null = null): Observable<BookingList> {
    this.calls.push({ tab, cursor });
    const next = this.pages[tab].shift() ?? { items: [], nextCursor: null };
    return next instanceof ApiError ? throwError(() => next) : of(next);
  }
}

class FakeAuth {
  ready = signal(true);
  user = signal<{ email: string; name: string | null } | null>({ email: 'p@example.com', name: 'P' });
  signInOpened = 0;
  openSignIn = () => this.signInOpened++;
}

const fail = (code: string, status: number) => new ApiError(code, 'm', status, 'req-1');

describe('MyBookings page', () => {
  let bookings: FakeBookings;
  let auth: FakeAuth;
  let paid: string[];
  let payFailure: ApiError | null;
  let modal: BookingModalService;

  const render = async (e?: string) => {
    const fixture = TestBed.createComponent(MyBookings);
    if (e) fixture.componentRef.setInput('e', e);
    fixture.detectChanges();
    await settle();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const refresh = async () => {
      await settle();
      fixture.detectChanges();
    };
    return { fixture, root, refresh };
  };
  const text = (root: HTMLElement) => root.textContent?.replace(/\s+/g, ' ') ?? '';

  beforeEach(() => {
    bookings = new FakeBookings();
    auth = new FakeAuth();
    paid = [];
    payFailure = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: BookingsService, useValue: bookings },
        { provide: AuthService, useValue: auth },
        {
          provide: PaymentService,
          useValue: {
            startPayment: async (ref: string) => {
              if (payFailure) throw payFailure;
              paid.push(ref);
            },
          },
        },
      ],
    });
    modal = TestBed.inject(BookingModalService);
  });

  it('asks a signed-out visitor to sign in and loads nothing', async () => {
    auth.user.set(null);
    const { root } = await render();
    expect(text(root)).toContain('Sign in to see the bookings you have made');
    root.querySelector<HTMLButtonElement>('.btn')!.click();
    expect(auth.signInOpened).toBe(1);
    expect(bookings.calls).toEqual([]);
  });

  it('loads the first page of the Active tab only, on start', async () => {
    const { root } = await render();
    expect(bookings.calls).toEqual([{ tab: 'active', cursor: null }]);
    expect(root.querySelector('#tab-active')?.getAttribute('aria-selected')).toBe('true');
  });

  it('lists each booking with its package, reference, date in India time, amount and status, linking to its page', async () => {
    bookings.pages.active = [{ items: [item('ED-8CT0AV', 'CONFIRMED')], nextCursor: null }];
    const { root } = await render();
    const row = text(root);
    expect(row).toContain('One-Time Consult');
    expect(row).toContain('ED-8CT0AV');
    expect(row).toContain('Confirmed');
    expect(row).toContain('₹2499');
    expect(row).toMatch(/24 Oct 2026, 1:13\s?am/i);
    expect(root.querySelector('a.info')?.getAttribute('href')).toBe('/booking/ED-8CT0AV');
  });

  it('shows Pay now only when the booking can be paid, and "Payment processing" when a payment is in progress', async () => {
    bookings.pages.active = [
      { items: [item('ED-A', 'PENDING_PAYMENT', true), item('ED-B', 'PENDING_PAYMENT', false), item('ED-C', 'CONFIRMED')], nextCursor: null },
    ];
    const { root } = await render();
    const rows = Array.from(root.querySelectorAll('li.row'));
    expect(rows[0].textContent).toContain('Awaiting payment');
    expect(rows[0].querySelector('.pay')).not.toBeNull();
    expect(rows[1].textContent).toContain('Payment processing');
    expect(rows[1].querySelector('.pay')).toBeNull();
    expect(rows[2].querySelector('.pay')).toBeNull();
  });

  it('Pay now starts the payment for that booking', async () => {
    bookings.pages.active = [{ items: [item('ED-A', 'PENDING_PAYMENT', true)], nextCursor: null }];
    const { root, refresh } = await render();
    root.querySelector<HTMLButtonElement>('.pay')!.click();
    await refresh();
    expect(paid).toEqual(['ED-A']);
  });

  it('shows a payment problem under the row that had it', async () => {
    bookings.pages.active = [{ items: [item('ED-A', 'PENDING_PAYMENT', true)], nextCursor: null }];
    payFailure = fail('PAYMENT_GATEWAY_UNAVAILABLE', 503);
    const { root, refresh } = await render();
    root.querySelector<HTMLButtonElement>('.pay')!.click();
    await refresh();
    expect(root.querySelector('.row-error')?.textContent).toContain('temporarily unavailable');
    expect(root.querySelector<HTMLButtonElement>('.pay')!.disabled).toBe(false);
  });

  it('shows an empty state with Book now when there are no active bookings', async () => {
    const { root } = await render();
    expect(text(root)).toContain('No bookings yet');
    root.querySelector<HTMLButtonElement>('.empty .btn')!.click();
    expect(modal.isOpen()).toBe(true);
    expect(modal.mode()).toBe('book');
  });

  it('loads the Past tab only when it is opened, and keeps both tabs’ lists', async () => {
    bookings.pages.active = [{ items: [item('ED-A', 'CONFIRMED')], nextCursor: null }];
    bookings.pages.past = [{ items: [item('ED-Z', 'EXPIRED')], nextCursor: null }];
    const { root, refresh } = await render();
    expect(bookings.calls.map((c) => c.tab)).toEqual(['active']);

    root.querySelector<HTMLButtonElement>('#tab-past')!.click();
    await refresh();
    expect(bookings.calls.map((c) => c.tab)).toEqual(['active', 'past']);
    expect(text(root)).toContain('ED-Z');
    expect(text(root)).toContain('Expired');

    root.querySelector<HTMLButtonElement>('#tab-active')!.click();
    await refresh();
    expect(text(root)).toContain('ED-A');
    expect(bookings.calls).toHaveLength(2);
  });

  it('moves between the tabs with the arrow keys', async () => {
    const { root, refresh } = await render();
    root.querySelector('[role="tablist"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    await refresh();
    expect(root.querySelector('#tab-past')?.getAttribute('aria-selected')).toBe('true');
  });

  it('Load more passes the previous cursor back untouched, adds the next page below, and disappears at the end', async () => {
    bookings.pages.active = [
      { items: [item('ED-1', 'CONFIRMED')], nextCursor: 'cur_1' },
      { items: [item('ED-2', 'CONFIRMED')], nextCursor: null },
    ];
    const { root, refresh } = await render();
    const more = root.querySelector<HTMLButtonElement>('.more')!;
    expect(more).not.toBeNull();
    more.click();
    await refresh();
    expect(bookings.calls[1]).toEqual({ tab: 'active', cursor: 'cur_1' });
    expect(Array.from(root.querySelectorAll('li.row .mono')).map((e) => e.textContent)).toEqual(['ED-1', 'ED-2']);
    expect(root.querySelector('.more')).toBeNull();
  });

  it('shows a load error with Try again, which asks again', async () => {
    bookings.pages.active = [fail('NETWORK', 0), { items: [item('ED-1', 'CONFIRMED')], nextCursor: null }];
    const { root, refresh } = await render();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Check your connection');
    root.querySelector<HTMLButtonElement>('.error ~ .btn')!.click();
    await refresh();
    expect(text(root)).toContain('ED-1');
    expect(root.querySelector('.error')).toBeNull();
  });

  it('shows a notice for the ?e= flag the payment callback may add', async () => {
    const { root } = await render('verify');
    expect(root.querySelector('.notice')?.textContent).toContain('could not verify');
  });
});
