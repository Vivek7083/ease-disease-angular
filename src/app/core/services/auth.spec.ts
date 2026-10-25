import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiErrorInterceptor } from '../api/api-error.interceptor';
import type { UserProfile } from '../api/api-types';
import { authInterceptor } from '../auth/auth.interceptor';
import { FirebaseAuthClient, type FirebaseUserInfo } from '../auth/firebase-auth-client';
import { AuthService, safeNext } from './auth';

const PROFILE: UserProfile = {
  id: 'u1',
  email: 'priya@example.com',
  name: 'Priya',
  phone: null,
  dob: null,
  authProvider: 'google.com',
  lastAuthProvider: 'google.com',
};

/** Stands in for the Firebase SDK. The test decides who is signed in and what each step does. */
class FakeFirebase {
  user: FirebaseUserInfo | null = null;
  listener: ((user: FirebaseUserInfo | null) => void) | null = null;
  signOutCalls = 0;
  googleError: unknown = null;
  emailLinkSentTo: { email: string; url: string } | null = null;
  completedWith: { email: string; url: string } | null = null;

  async watch(cb: (user: FirebaseUserInfo | null) => void): Promise<void> {
    this.listener = cb;
    cb(this.user);
  }
  async signInWithGoogle(): Promise<void> {
    if (this.googleError) throw this.googleError;
    this.signIn();
  }
  async sendEmailLink(email: string, url: string): Promise<void> {
    this.emailLinkSentTo = { email, url };
  }
  async isEmailLink(url: string): Promise<boolean> {
    return url.includes('oobCode');
  }
  async completeEmailLink(email: string, url: string): Promise<void> {
    this.completedWith = { email, url };
    this.signIn();
  }
  async signOut(): Promise<void> {
    this.signOutCalls++;
    this.user = null;
    this.listener?.(null);
  }
  async getIdToken(): Promise<string | null> {
    return this.user ? 'token' : null;
  }
  private signIn(): void {
    this.user = { email: 'priya@example.com', displayName: 'Priya' };
    this.listener?.(this.user);
  }
}

/** Lets the pending promises (and the interceptor's async token step) run before the test looks at HTTP. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

const apiError = (code: string, status: number, details: Record<string, unknown> = {}) => ({
  body: { error: { code, message: 'm', details, requestId: 'req-1' } },
  opts: { status, statusText: 'x' },
});

describe('safeNext', () => {
  it('keeps internal paths', () => {
    expect(safeNext('/my-bookings')).toBe('/my-bookings');
    expect(safeNext('/booking/ED-1?e=busy')).toBe('/booking/ED-1?e=busy');
  });

  it('refuses anything that could leave the site', () => {
    for (const bad of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '', null, undefined]) {
      expect(safeNext(bad)).toBe('/');
    }
  });
});

describe('AuthService', () => {
  let fake: FakeFirebase;
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    fake = new FakeFirebase();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: FirebaseAuthClient, useValue: fake },
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('is ready and signed out when there is no session, without calling the API', async () => {
    auth.start();
    await settle();
    expect(auth.ready()).toBe(true);
    expect(auth.user()).toBeNull();
  });

  it('restores an existing session with GET /v1/me (not a sync)', async () => {
    fake.user = { email: 'priya@example.com', displayName: 'Priya' };
    auth.start();
    await settle();
    const req = http.expectOne('/v1/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({ user: PROFILE, profileComplete: false });
    await settle();
    expect(auth.user()).toEqual({ email: 'priya@example.com', name: 'Priya' });
    expect(auth.ready()).toBe(true);
  });

  it('signs in with Google, then syncs once with POST /v1/auth/sync (and does not also call /v1/me)', async () => {
    auth.start();
    await settle();
    const done = auth.signInWithGoogle();
    await settle();
    const req = http.expectOne('/v1/auth/sync');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush({ user: PROFILE, profileComplete: false });
    expect(await done).toBe(true);
    expect(auth.user()?.email).toBe('priya@example.com');
    expect(auth.busy()).toBe(false);
  });

  it('says nothing when the person closes the Google window', async () => {
    auth.start();
    await settle();
    fake.googleError = { code: 'auth/popup-closed-by-user' };
    expect(await auth.signInWithGoogle()).toBe(false);
    expect(auth.error()).toBeNull();
    expect(auth.busy()).toBe(false);
  });

  it('signs out and explains when the API says the email is not verified', async () => {
    auth.start();
    await settle();
    const done = auth.signInWithGoogle();
    await settle();
    const { body, opts } = apiError('EMAIL_NOT_VERIFIED', 403);
    http.expectOne('/v1/auth/sync').flush(body, opts);
    expect(await done).toBe(false);
    expect(fake.signOutCalls).toBe(1);
    expect(auth.error()).toContain('verify your email');
    expect(auth.user()).toBeNull();
    // The person was in the middle of signing in, so the sign-in step shows it: no site-wide notice.
    expect(auth.sessionNotice()).toBeNull();
  });

  it('tells the person site-wide when a restored session turns out to be refused', async () => {
    fake.user = { email: 'priya@example.com', displayName: null };
    auth.start();
    await settle();
    const { body, opts } = apiError('UNAUTHENTICATED', 401);
    // The interceptor refreshes the token once and retries; the API refuses both times.
    http.expectOne('/v1/me').flush(body, opts);
    await settle();
    http.expectOne('/v1/me').flush(body, opts);
    await settle();
    expect(fake.signOutCalls).toBeGreaterThanOrEqual(1);
    expect(auth.user()).toBeNull();
    expect(auth.sessionNotice()).toContain('session ended');
  });

  it('shows the session notice when the interceptor ends the session, and clears it on the next sign-in', async () => {
    auth.start();
    await settle();
    auth.sessionExpired();
    await settle();
    expect(auth.sessionNotice()).toContain('session ended');

    const done = auth.signInWithGoogle();
    await settle();
    http.expectOne('/v1/auth/sync').flush({ user: PROFILE, profileComplete: false });
    await done;
    expect(auth.sessionNotice()).toBeNull();
  });

  it('can dismiss the notice', async () => {
    auth.start();
    await settle();
    auth.sessionExpired();
    auth.dismissNotice();
    expect(auth.sessionNotice()).toBeNull();
  });

  it('keeps the Firebase session and offers a retry when sign-in is temporarily unavailable', async () => {
    fake.user = { email: 'priya@example.com', displayName: null };
    auth.start();
    await settle();
    const { body, opts } = apiError('AUTH_UNAVAILABLE', 503);
    http.expectOne('/v1/me').flush(body, opts);
    await settle();
    expect(fake.signOutCalls).toBe(0);
    expect(auth.needsRetry()).toBe(true);
    expect(auth.user()).toBeNull();
    expect(auth.ready()).toBe(true);

    const retrying = auth.retry();
    await settle();
    http.expectOne('/v1/me').flush({ user: PROFILE, profileComplete: false });
    await retrying;
    expect(auth.needsRetry()).toBe(false);
    expect(auth.user()?.email).toBe('priya@example.com');
  });

  it('asks for the email when an email link is opened where it was not requested', async () => {
    auth.start();
    await settle();
    expect(await auth.finishEmailLink('https://site/auth/finish?oobCode=x')).toBe('needs-email');
  });

  it('completes an email link with the email typed again, and syncs', async () => {
    auth.start();
    await settle();
    const done = auth.finishEmailLink('https://site/auth/finish?oobCode=x', '  priya@example.com ');
    await settle();
    http.expectOne('/v1/auth/sync').flush({ user: PROFILE, profileComplete: false });
    expect(await done).toBe('done');
    expect(fake.completedWith?.email).toBe('priya@example.com');
  });

  it('remembers the email it sent a link to, and uses it when the link comes back', async () => {
    auth.start();
    await settle();
    expect(await auth.sendEmailLink('priya@example.com', '/my-bookings')).toBe(true);
    expect(fake.emailLinkSentTo?.url).toBe(`${window.location.origin}/auth/finish?next=%2Fmy-bookings`);

    const done = auth.finishEmailLink('https://site/auth/finish?oobCode=x');
    await settle();
    http.expectOne('/v1/auth/sync').flush({ user: PROFILE, profileComplete: false });
    expect(await done).toBe('done');
    expect(localStorage.getItem('ed-email-for-sign-in')).toBeNull();
  });

  it('never puts an off-site address in the link it emails', async () => {
    await auth.sendEmailLink('priya@example.com', 'https://evil.example');
    expect(fake.emailLinkSentTo?.url).toBe(`${window.location.origin}/auth/finish?next=%2F`);
  });

  it('signs out of Firebase and clears the profile', async () => {
    fake.user = { email: 'priya@example.com', displayName: null };
    auth.start();
    await settle();
    http.expectOne('/v1/me').flush({ user: PROFILE, profileComplete: false });
    await settle();
    await auth.signOut();
    expect(fake.signOutCalls).toBe(1);
    expect(auth.user()).toBeNull();
  });
});
