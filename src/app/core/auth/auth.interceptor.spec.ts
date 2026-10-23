import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from '../api/api-client';
import { ApiError } from '../api/api-error';
import { apiErrorInterceptor } from '../api/api-error.interceptor';
import { AuthService } from '../services/auth';
import { authInterceptor } from './auth.interceptor';

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

const unauthenticated = {
  body: { error: { code: 'UNAUTHENTICATED', message: 'm', details: {}, requestId: 'r' } },
  opts: { status: 401, statusText: 'Unauthorized' },
};

describe('authInterceptor', () => {
  let api: ApiClient;
  let http: HttpTestingController;
  let session = true;
  let expired = 0;
  const tokenCalls: boolean[] = [];

  /** Only the three things the interceptor uses; the real service is covered in auth.spec.ts. */
  const authStub = {
    hasSession: () => session,
    idToken: async (force = false) => {
      tokenCalls.push(force);
      return session ? (force ? 'fresh' : 'old') : null;
    },
    sessionExpired: () => {
      expired++;
    },
  };

  beforeEach(() => {
    session = true;
    expired = 0;
    tokenCalls.length = 0;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authStub },
      ],
    });
    api = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('adds the Bearer token to API calls while signed in', async () => {
    api.get('/v1/me').subscribe();
    await settle();
    const req = http.expectOne('/v1/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer old');
    req.flush({});
  });

  it('sends no Authorization header when signed out', async () => {
    session = false;
    api.get('/v1/me').subscribe({ error: () => {} });
    await settle();
    const req = http.expectOne('/v1/me');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('leaves the public routes without a token', () => {
    for (const path of ['/healthz', '/v1/packages']) {
      api.get(path).subscribe();
      const req = http.expectOne(path);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    }
    expect(tokenCalls).toEqual([]);
  });

  it('on a 401 fetches a fresh token and retries once, and the caller sees the success', async () => {
    let result: unknown;
    api.get('/v1/bookings').subscribe((body) => (result = body));
    await settle();
    http.expectOne('/v1/bookings').flush(unauthenticated.body, unauthenticated.opts);
    await settle();
    const retry = http.expectOne('/v1/bookings');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer fresh');
    retry.flush({ items: [] });
    expect(result).toEqual({ items: [] });
    expect(tokenCalls).toEqual([false, true]);
    expect(expired).toBe(0);
  });

  it('when the fresh token is refused too, ends the session and does not retry again', async () => {
    let caught: unknown;
    api.get('/v1/bookings').subscribe({ error: (e: unknown) => (caught = e) });
    await settle();
    http.expectOne('/v1/bookings').flush(unauthenticated.body, unauthenticated.opts);
    await settle();
    http.expectOne('/v1/bookings').flush(unauthenticated.body, unauthenticated.opts);
    await settle();
    expect(expired).toBe(1);
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).code).toBe('UNAUTHENTICATED');
  });

  it('does not retry other failures', async () => {
    let caught: unknown;
    api.get('/v1/bookings').subscribe({ error: (e: unknown) => (caught = e) });
    await settle();
    http
      .expectOne('/v1/bookings')
      .flush({ error: { code: 'RATE_LIMITED', message: 'm', details: {}, requestId: 'r' } }, { status: 429, statusText: 'x' });
    await settle();
    expect((caught as ApiError).code).toBe('RATE_LIMITED');
    expect(expired).toBe(0);
  });
});
