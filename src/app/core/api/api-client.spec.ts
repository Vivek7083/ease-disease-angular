import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from './api-client';
import { ApiError } from './api-error';
import { apiErrorInterceptor } from './api-error.interceptor';

describe('ApiClient with the error interceptor', () => {
  let api: ApiClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns the body of a successful GET', () => {
    let result: unknown;
    api.get<{ status: string }>('/healthz').subscribe((body) => (result = body));
    http.expectOne('/healthz').flush({ status: 'ok' });
    expect(result).toEqual({ status: 'ok' });
  });

  it('sends extra headers, such as Idempotency-Key, on a POST', () => {
    const key = api.idempotencyKey();
    api.post('/v1/bookings', { a: 1 }, { headers: { 'Idempotency-Key': key } }).subscribe();
    const req = http.expectOne('/v1/bookings');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toBe(key);
    req.flush({});
  });

  it('makes a new idempotency key each time, in uuid v4 form', () => {
    const [a, b] = [api.idempotencyKey(), api.idempotencyKey()];
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('turns a 404 into an ApiError that carries the requestId', () => {
    let caught: unknown;
    api.get('/v1/bookings/ED-NOPE').subscribe({ error: (e: unknown) => (caught = e) });
    http
      .expectOne('/v1/bookings/ED-NOPE')
      .flush(
        { error: { code: 'BOOKING_NOT_FOUND', message: 'No such booking', details: {}, requestId: 'req-404' } },
        { status: 404, statusText: 'Not Found' },
      );
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).code).toBe('BOOKING_NOT_FOUND');
    expect((caught as ApiError).requestId).toBe('req-404');
  });

  it('turns a network failure into an ApiError with code NETWORK', () => {
    let caught: unknown;
    api.get('/v1/me').subscribe({ error: (e: unknown) => (caught = e) });
    http.expectOne('/v1/me').error(new ProgressEvent('error'));
    expect((caught as ApiError).code).toBe('NETWORK');
  });
});
