import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from '../api/api-client';
import { AppCheckClient } from './app-check-client';
import { appCheckInterceptor, needsAppCheck } from './app-check.interceptor';

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

describe('needsAppCheck', () => {
  it('is true for exactly the three protected POSTs', () => {
    expect(needsAppCheck('POST', '/v1/auth/sync')).toBe(true);
    expect(needsAppCheck('POST', '/v1/bookings')).toBe(true);
    expect(needsAppCheck('POST', '/v1/bookings/ED-7K3QXM/checkout')).toBe(true);
  });

  it('is false for everything else', () => {
    expect(needsAppCheck('GET', '/v1/me')).toBe(false);
    expect(needsAppCheck('GET', '/v1/bookings')).toBe(false);
    expect(needsAppCheck('GET', '/v1/bookings/ED-7K3QXM')).toBe(false);
    expect(needsAppCheck('GET', '/v1/packages')).toBe(false);
    expect(needsAppCheck('POST', '/v1/bookings/ED-7K3QXM')).toBe(false);
    expect(needsAppCheck('POST', '/v1/bookings/a/b/checkout')).toBe(false);
    expect(needsAppCheck('POST', '/v1/payments/payu/callback')).toBe(false);
    expect(needsAppCheck('POST', 'https://elsewhere.example/v1/bookings')).toBe(false);
  });
});

describe('appCheckInterceptor', () => {
  let api: ApiClient;
  let http: HttpTestingController;
  let on: boolean;
  let token: string | null;
  let tokenCalls: number;

  const fakeClient = {
    get enabled() {
      return on;
    },
    token: async () => {
      tokenCalls++;
      return token;
    },
  };

  beforeEach(() => {
    on = true;
    token = 'app-check-token';
    tokenCalls = 0;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([appCheckInterceptor])),
        provideHttpClientTesting(),
        { provide: AppCheckClient, useValue: fakeClient },
      ],
    });
    api = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('adds the App Check header to a protected POST', async () => {
    api.post('/v1/bookings', {}).subscribe();
    await settle();
    const req = http.expectOne('/v1/bookings');
    expect(req.request.headers.get('X-Firebase-AppCheck')).toBe('app-check-token');
    req.flush({});
  });

  it('adds it to sign-in sync and checkout too', async () => {
    for (const path of ['/v1/auth/sync', '/v1/bookings/ED-1/checkout']) {
      api.post(path).subscribe();
      await settle();
      const req = http.expectOne(path);
      expect(req.request.headers.get('X-Firebase-AppCheck'), path).toBe('app-check-token');
      req.flush({});
    }
  });

  it('leaves reads and public routes alone, without even asking for a token', async () => {
    for (const path of ['/v1/me', '/v1/bookings', '/v1/packages']) {
      api.get(path).subscribe();
      const req = http.expectOne((r) => r.url === path);
      expect(req.request.headers.has('X-Firebase-AppCheck'), path).toBe(false);
      req.flush({});
    }
    expect(tokenCalls).toBe(0);
  });

  it('sends nothing extra while App Check is off', async () => {
    on = false;
    api.post('/v1/bookings', {}).subscribe();
    const req = http.expectOne('/v1/bookings');
    expect(req.request.headers.has('X-Firebase-AppCheck')).toBe(false);
    expect(tokenCalls).toBe(0);
    req.flush({});
  });

  it('still sends the request, without the header, when no token could be had', async () => {
    token = null;
    api.post('/v1/bookings', {}).subscribe();
    await settle();
    const req = http.expectOne('/v1/bookings');
    expect(req.request.headers.has('X-Firebase-AppCheck')).toBe(false);
    req.flush({});
  });
});

describe('AppCheckClient', () => {
  it('is off, and hands out no token, when the environment has no site key', async () => {
    const client = TestBed.inject(AppCheckClient);
    expect(client.enabled).toBe(false);
    expect(await client.token()).toBeNull();
  });
});
