import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ApiError } from '../api/api-error';
import { apiErrorInterceptor } from '../api/api-error.interceptor';
import type { CheckoutForm } from '../api/api-types';
import { PaymentService } from './payment';

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

const FORM: CheckoutForm = {
  gatewayUrl: 'https://test.payu.in/_payment',
  method: 'POST',
  fields: {
    key: 'merchant-key',
    txnid: 'EDTX01ABC',
    amount: '2499.00',
    productinfo: 'One-Time Consult',
    firstname: 'Priya',
    email: 'priya@example.com',
    phone: '9876543210',
    surl: 'http://localhost:3000/v1/payments/payu/callback',
    furl: 'http://localhost:3000/v1/payments/payu/callback',
    udf1: 'ED-7K3QXM',
    hash: 'abc123',
  },
};

const apiFailure = (code: string, status: number) => ({
  body: { error: { code, message: 'm', details: {}, requestId: 'r' } },
  opts: { status, statusText: 'x' },
});

describe('PaymentService', () => {
  let payment: PaymentService;
  let http: HttpTestingController;
  let submitted: HTMLFormElement[];

  beforeEach(() => {
    submitted = [];
    // jsdom cannot navigate; record the form instead of submitting it.
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(function (this: HTMLFormElement) {
      submitted.push(this);
    });
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()],
    });
    payment = TestBed.inject(PaymentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    document.body.querySelectorAll('form').forEach((f) => f.remove());
    vi.restoreAllMocks();
  });

  it('asks for the booking’s payment form with an Idempotency-Key and no body', async () => {
    const done = payment.startPayment('ED-7K3QXM');
    const req = http.expectOne('/v1/bookings/ED-7K3QXM/checkout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    expect(req.request.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/);
    req.flush(FORM);
    await done;
  });

  it('posts every field to the gateway exactly as given, in order, and adds nothing', async () => {
    const done = payment.startPayment('ED-7K3QXM');
    http.expectOne('/v1/bookings/ED-7K3QXM/checkout').flush(FORM);
    await done;

    expect(submitted).toHaveLength(1);
    const form = submitted[0];
    expect(form.method).toBe('post');
    expect(form.action).toBe('https://test.payu.in/_payment');
    const sent = Array.from(form.querySelectorAll('input')).map((i) => [i.name, i.value, i.type]);
    expect(sent).toEqual(Object.entries(FORM.fields).map(([name, value]) => [name, value, 'hidden']));
  });

  it('refuses a form that is not an https POST, and submits nothing', async () => {
    for (const bad of [
      { ...FORM, gatewayUrl: 'http://test.payu.in/_payment' },
      { ...FORM, gatewayUrl: 'javascript:alert(1)' },
      { ...FORM, method: 'GET' as unknown as 'POST' },
    ]) {
      const done = payment.startPayment('ED-1');
      http.expectOne('/v1/bookings/ED-1/checkout').flush(bad);
      await expect(done).rejects.toBeDefined();
    }
    expect(submitted).toEqual([]);
  });

  it('reuses the Idempotency-Key when the same booking is tried again after a failure', async () => {
    const first = payment.startPayment('ED-1');
    const a = http.expectOne('/v1/bookings/ED-1/checkout');
    const { body, opts } = apiFailure('PAYMENT_GATEWAY_UNAVAILABLE', 503);
    a.flush(body, opts);
    await expect(first).rejects.toBeInstanceOf(ApiError);

    const second = payment.startPayment('ED-1');
    const b = http.expectOne('/v1/bookings/ED-1/checkout');
    expect(b.request.headers.get('Idempotency-Key')).toBe(a.request.headers.get('Idempotency-Key'));
    b.flush(FORM);
    await second;
  });

  it('uses a different key for a different booking', async () => {
    const one = payment.startPayment('ED-1');
    const a = http.expectOne('/v1/bookings/ED-1/checkout');
    const { body, opts } = apiFailure('NETWORK', 500);
    a.flush(body, opts);
    await expect(one).rejects.toBeDefined();
    const two = payment.startPayment('ED-2');
    const b = http.expectOne('/v1/bookings/ED-2/checkout');
    expect(b.request.headers.get('Idempotency-Key')).not.toBe(a.request.headers.get('Idempotency-Key'));
    b.flush(FORM);
    await two;
  });

  it('tries once more with a fresh key when the API says the key was used for something else', async () => {
    const done = payment.startPayment('ED-1');
    const first = http.expectOne('/v1/bookings/ED-1/checkout');
    const { body, opts } = apiFailure('IDEMPOTENCY_CONFLICT', 409);
    first.flush(body, opts);
    await settle();
    const second = http.expectOne('/v1/bookings/ED-1/checkout');
    expect(second.request.headers.get('Idempotency-Key')).not.toBe(first.request.headers.get('Idempotency-Key'));
    second.flush(FORM);
    await done;
    expect(submitted).toHaveLength(1);
  });

  it('passes a refusal to the caller, for example a booking that can no longer be paid', async () => {
    const done = payment.startPayment('ED-1');
    const { body, opts } = apiFailure('BOOKING_NOT_PAYABLE', 409);
    http.expectOne('/v1/bookings/ED-1/checkout').flush(body, opts);
    await expect(done).rejects.toMatchObject({ code: 'BOOKING_NOT_PAYABLE' });
    expect(submitted).toEqual([]);
  });
});
