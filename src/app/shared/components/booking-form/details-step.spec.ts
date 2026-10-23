import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ApiError } from '../../../core/api/api-error';
import type { BookingCreated, CreateBookingRequest } from '../../../core/api/api-types';
import { MAIN_PLAN } from '../../../core/config/booking';
import { BookingsService } from '../../../core/services/bookings';
import { PackagesService } from '../../../core/services/packages';
import { DetailsStep } from './details-step';

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

const CREATED: BookingCreated = {
  reference: 'ED-7K3QXM',
  status: 'PENDING_PAYMENT',
  packageTitle: 'One-Time Consult',
  amountPaise: 249900,
  currency: 'INR',
  name: 'Priya Sharma',
  whatsappNumber: '+919876543210',
  email: 'priya@example.com',
  age: 34,
  city: 'Pune',
  gender: null,
  canPay: true,
  payment: null,
  createdAt: '2026-10-24T10:00:00.000Z',
};

/** Answers create() from a queue: a booking, or an ApiError to throw. Records every request and key. */
class FakeBookings {
  calls: { request: CreateBookingRequest; key: string }[] = [];
  answers: (BookingCreated | ApiError)[] = [];
  create(request: CreateBookingRequest, key: string): Observable<BookingCreated> {
    this.calls.push({ request, key });
    const answer = this.answers.shift() ?? CREATED;
    return answer instanceof ApiError ? throwError(() => answer) : of(answer);
  }
}

const fail = (code: string, status: number, details: Record<string, unknown> = {}, retryAfter: number | null = null) =>
  new ApiError(code, 'm', status, 'req-1', details, retryAfter);

describe('DetailsStep', () => {
  let bookings: FakeBookings;
  let reloads: number;

  const render = () => {
    const fixture = TestBed.createComponent(DetailsStep);
    const created: BookingCreated[] = [];
    fixture.componentInstance.created.subscribe((b) => created.push(b));
    fixture.detectChanges();
    return { fixture, root: fixture.nativeElement as HTMLElement, created };
  };

  const type = (root: HTMLElement, selector: string, value: string) => {
    const input = root.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const click = (root: HTMLElement, selector: string) => root.querySelector<HTMLElement>(selector)!.click();
  const fillValid = (root: HTMLElement) => {
    type(root, '#bk-name', '  Priya Sharma ');
    type(root, '#bk-phone', '+91 98765 43210');
    type(root, '#bk-email', 'Priya@Example.com');
    type(root, '#bk-age', '34');
    type(root, '#bk-city', 'Pune');
    click(root, '.bk-consent input');
  };
  const submitForm = async (fixture: { detectChanges: () => void }, root: HTMLElement) => {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
    fixture.detectChanges();
  };

  beforeEach(() => {
    bookings = new FakeBookings();
    reloads = 0;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: BookingsService, useValue: bookings },
        { provide: PackagesService, useValue: { plan: signal(MAIN_PLAN), packageId: signal('pkg-1'), reload: () => reloads++ } },
      ],
    });
  });

  it('starts with the country code filled in and a Pay button that shows the price', () => {
    const { root } = render();
    expect(root.querySelector<HTMLInputElement>('#bk-phone')!.value).toBe('+91 ');
    expect(root.querySelector('.bk-btn-primary')?.textContent).toContain('Pay ₹2499');
  });

  it('shows what is missing and sends nothing when submitted empty', async () => {
    const { fixture, root } = render();
    await submitForm(fixture, root);
    for (const id of ['name', 'phone', 'email', 'age', 'city', 'consent']) {
      expect(root.querySelector(`#bk-${id}-err`), id).not.toBeNull();
    }
    expect(bookings.calls).toEqual([]);
  });

  it('creates the booking with exactly the API body and tells the dialog', async () => {
    const { fixture, root, created } = render();
    fillValid(root);
    await submitForm(fixture, root);
    expect(bookings.calls).toHaveLength(1);
    expect(bookings.calls[0].request).toEqual({
      packageId: 'pkg-1',
      name: 'Priya Sharma',
      whatsappNumber: '+919876543210',
      email: 'priya@example.com',
      age: 34,
      city: 'Pune',
      consent: true,
    });
    expect(created).toEqual([CREATED]);
  });

  it('sends the chosen gender, and a bare 10-digit Indian number as +91', async () => {
    const { fixture, root } = render();
    fillValid(root);
    type(root, '#bk-phone', '98765 43210');
    click(root, '.bk-chips label:nth-child(2) input');
    await submitForm(fixture, root);
    expect(bookings.calls[0].request.gender).toBe('Male');
    expect(bookings.calls[0].request.whatsappNumber).toBe('+919876543210');
  });

  it('puts the API’s complaint about the phone number under the phone field', async () => {
    bookings.answers = [fail('VALIDATION_FAILED', 400, { fields: { whatsappNumber: 'Not a number we can reach' } })];
    const { fixture, root, created } = render();
    fillValid(root);
    await submitForm(fixture, root);
    expect(root.querySelector('#bk-phone-err')?.textContent).toContain('Not a number we can reach');
    expect(created).toEqual([]);
  });

  it('keeps the same Idempotency-Key when the identical request is sent again after a network failure', async () => {
    bookings.answers = [fail('NETWORK', 0)];
    const { fixture, root, created } = render();
    fillValid(root);
    await submitForm(fixture, root);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Check your connection');
    await submitForm(fixture, root);
    expect(bookings.calls).toHaveLength(2);
    expect(bookings.calls[1].key).toBe(bookings.calls[0].key);
    expect(created).toEqual([CREATED]);
  });

  it('uses a new Idempotency-Key once anything is edited', async () => {
    bookings.answers = [fail('NETWORK', 0)];
    const { fixture, root } = render();
    fillValid(root);
    await submitForm(fixture, root);
    type(root, '#bk-city', 'Mumbai');
    await submitForm(fixture, root);
    expect(bookings.calls[1].key).not.toBe(bookings.calls[0].key);
  });

  it('retries once with a new key when the API says the key was used for a different request', async () => {
    bookings.answers = [fail('IDEMPOTENCY_CONFLICT', 409)];
    const { fixture, root, created } = render();
    fillValid(root);
    await submitForm(fixture, root);
    expect(bookings.calls).toHaveLength(2);
    expect(bookings.calls[1].key).not.toBe(bookings.calls[0].key);
    expect(created).toEqual([CREATED]);
  });

  it('on a rate limit, says how long to wait and disables Pay', async () => {
    bookings.answers = [fail('RATE_LIMITED', 429, { retryAfterSeconds: 90 }, 90)];
    const { fixture, root } = render();
    fillValid(root);
    await submitForm(fixture, root);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('90 seconds');
    const button = root.querySelector<HTMLButtonElement>('.bk-btn-primary')!;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Please wait 90s');
  });

  it('says the consultation is unavailable and reloads the package when it is switched off', async () => {
    bookings.answers = [fail('PACKAGE_NOT_ACTIVE', 409)];
    const { fixture, root } = render();
    fillValid(root);
    await submitForm(fixture, root);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('not available right now');
    expect(reloads).toBe(1);
  });

  it('shows the daily limit message', async () => {
    bookings.answers = [fail('DAILY_BOOKING_LIMIT', 409)];
    const { fixture, root } = render();
    fillValid(root);
    await submitForm(fixture, root);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('try again tomorrow');
  });
});
