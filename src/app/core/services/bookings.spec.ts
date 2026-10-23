import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiError } from '../api/api-error';
import { apiErrorInterceptor } from '../api/api-error.interceptor';
import type { BookingCreated, CreateBookingRequest } from '../api/api-types';
import { BookingsService } from './bookings';

const request: CreateBookingRequest = {
  packageId: 'pkg-1',
  name: 'Priya Sharma',
  whatsappNumber: '+919876543210',
  email: 'priya@example.com',
  age: 34,
  city: 'Pune',
  consent: true,
};

const created: BookingCreated = {
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

describe('BookingsService.list', () => {
  let service: BookingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks for the first page of a tab without a cursor', () => {
    service.list('active').subscribe();
    const req = http.expectOne((r) => r.url === '/v1/bookings');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('status')).toBe('active');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.has('cursor')).toBe(false);
    req.flush({ items: [], nextCursor: null });
  });

  it('passes the previous page’s cursor back exactly as given', () => {
    service.list('past', 'abc_DEF-123').subscribe();
    const req = http.expectOne((r) => r.url === '/v1/bookings');
    expect(req.request.params.get('status')).toBe('past');
    expect(req.request.params.get('cursor')).toBe('abc_DEF-123');
    req.flush({ items: [], nextCursor: null });
  });
});

describe('BookingsService.create', () => {
  let service: BookingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the request with the Idempotency-Key and returns the booking from the { booking } answer', () => {
    let result: BookingCreated | undefined;
    service.create(request, 'the-key').subscribe((booking) => (result = booking));
    const req = http.expectOne('/v1/bookings');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toBe('the-key');
    expect(req.request.body).toEqual(request);
    req.flush({ booking: created }, { status: 201, statusText: 'Created' });
    expect(result?.reference).toBe('ED-7K3QXM');
  });

  it('surfaces a refusal as an ApiError with its field messages', () => {
    let caught: unknown;
    service.create(request, 'k').subscribe({ error: (e: unknown) => (caught = e) });
    http.expectOne('/v1/bookings').flush(
      { error: { code: 'VALIDATION_FAILED', message: 'm', details: { fields: { whatsappNumber: 'bad' } }, requestId: 'r' } },
      { status: 400, statusText: 'Bad Request' },
    );
    expect((caught as ApiError).fieldErrors).toEqual({ whatsappNumber: 'bad' });
  });
});
