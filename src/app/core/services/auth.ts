import { Service, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { ApiError } from '../api/api-error';
import type { ProfileResponse, UserProfile } from '../api/api-types';
import { describeError } from '../api/error-messages';
import { FirebaseAuthClient, type FirebaseUserInfo } from '../auth/firebase-auth-client';
import { BookingModalService } from './booking-modal';

export interface SignedInUser {
  readonly email: string;
  readonly name: string | null;
}

/** Where the typed email waits while the person opens the link from their inbox (this browser only). */
const EMAIL_FOR_SIGN_IN_KEY = 'ed-email-for-sign-in';

/** API answers that mean this login can never work: sign out of Firebase too, so the person starts clean. */
const SIGN_OUT_CODES = new Set(['UNAUTHENTICATED', 'EMAIL_NOT_VERIFIED', 'UNSUPPORTED_SIGN_IN_PROVIDER']);

/**
 * A `next` path from a URL is only followed when it is an internal path, so a
 * crafted link cannot send the person to another site after signing in.
 */
export function safeNext(raw: string | null | undefined): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\') ? raw : '/';
}

const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* private window or blocked storage: the "type your email again" step covers it */
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* nothing to clean up */
    }
  },
};

/**
 * Who is signed in. Firebase proves who the person is; the API's profile (from
 * POST /v1/auth/sync after a sign-in, GET /v1/me when restoring a session on
 * page load) is what the rest of the app reads. The Firebase SDK itself loads
 * lazily (see FirebaseAuthClient), so `ready` flips a moment after start.
 *
 * Failure rules (integration guide FE-2): a login the API will never accept
 * signs the person out; "Google or the network is unreachable" keeps the
 * Firebase session and offers a retry. Tokens are never stored or logged here.
 */
@Service()
export class AuthService {
  private readonly firebase = inject(FirebaseAuthClient);
  private readonly api = inject(ApiClient);
  private readonly modal = inject(BookingModalService);

  /** The API's profile of the signed-in person, or null. */
  readonly profile = signal<UserProfile | null>(null);
  /** The little the navbar needs. Null while signed out. */
  readonly user = computed<SignedInUser | null>(() => {
    const profile = this.profile();
    return profile ? { email: profile.email, name: profile.name } : null;
  });
  /** True once the first sign-in check finished; the navbar shows neither state until then. */
  readonly ready = signal(false);
  /** True while a sign-in step is running (disable the buttons). */
  readonly busy = signal(false);
  /** A sentence about the last sign-in problem, or null. */
  readonly error = signal<string | null>(null);
  /** True when Firebase has a session but the API could not confirm it (so a retry makes sense). */
  readonly needsRetry = signal(false);
  /** A gentle sentence shown site-wide after the person was signed out by an error, not by choice. Null otherwise. */
  readonly sessionNotice = signal<string | null>(null);

  private started = false;
  private signingIn = false;
  private firebaseUser: FirebaseUserInfo | null = null;

  /** Starts watching the Firebase session. Call once at app start-up. */
  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.firebase
      .watch((user) => void this.onFirebaseUser(user))
      .catch(() => this.ready.set(true));
  }

  /** True when Firebase has a session (a Bearer token can be made). */
  hasSession(): boolean {
    return this.firebaseUser !== null;
  }

  /** The Firebase ID token for the Authorization header, or null when signed out. `forceRefresh` after a 401. */
  idToken(forceRefresh = false): Promise<string | null> {
    return this.firebase.getIdToken(forceRefresh);
  }

  /** Opens the dialog on its sign-in step (the navbar's Log in / Sign up). */
  openSignIn(): void {
    this.modal.open('sign-in');
  }

  /** Google pop-up. Call straight from a click handler. Resolves true when signed in and the profile is loaded. */
  signInWithGoogle(): Promise<boolean> {
    return this.runSignIn(() => this.firebase.signInWithGoogle());
  }

  /** Emails a sign-in link that comes back to /auth/finish, then on to `next`. Resolves true when the email was sent. */
  async sendEmailLink(email: string, next: string): Promise<boolean> {
    if (this.busy()) {
      return false;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      const continueUrl = `${window.location.origin}/auth/finish?next=${encodeURIComponent(safeNext(next))}`;
      await this.firebase.sendEmailLink(email.trim(), continueUrl);
      storage.set(EMAIL_FOR_SIGN_IN_KEY, email.trim());
      return true;
    } catch (error) {
      this.error.set(describeError(error));
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  /** Whether `url` (the address of the current page) is a Firebase email sign-in link. */
  isEmailLink(url: string): Promise<boolean> {
    return this.firebase.isEmailLink(url);
  }

  /**
   * Completes an email-link sign-in. `typedEmail` is for a link opened in another browser or a mail app, where the
   * remembered email is missing: 'needs-email' says to ask for it and call again with it.
   */
  async finishEmailLink(url: string, typedEmail?: string): Promise<'done' | 'needs-email' | 'failed'> {
    const email = typedEmail?.trim() || storage.get(EMAIL_FOR_SIGN_IN_KEY);
    if (!email) {
      return 'needs-email';
    }
    const ok = await this.runSignIn(() => this.firebase.completeEmailLink(email, url));
    if (ok) {
      storage.remove(EMAIL_FOR_SIGN_IN_KEY);
    }
    return ok ? 'done' : 'failed';
  }

  dismissNotice(): void {
    this.sessionNotice.set(null);
  }

  /** Re-asks the API who this Firebase session is (after "Google or the network was unreachable"). */
  async retry(): Promise<void> {
    this.error.set(null);
    await this.restore();
  }

  async signOut(): Promise<void> {
    storage.remove(EMAIL_FOR_SIGN_IN_KEY);
    this.profile.set(null);
    this.needsRetry.set(false);
    try {
      await this.firebase.signOut();
    } catch {
      /* the local state is already cleared; Firebase will report the session gone on the next check */
    }
  }

  /** The token was refused even after a refresh: say so and sign out. Called by the auth interceptor. */
  sessionExpired(): void {
    this.sessionNotice.set(describeError(new ApiError('UNAUTHENTICATED', '', 401, null)));
    void this.signOut();
  }

  private async onFirebaseUser(user: FirebaseUserInfo | null): Promise<void> {
    this.firebaseUser = user;
    if (!user) {
      this.profile.set(null);
      this.ready.set(true);
      return;
    }
    // After an explicit sign-in, runSignIn syncs and sets the profile itself.
    if (!this.signingIn) {
      await this.restore();
    }
  }

  /** Page load with an existing Firebase session: read the profile (GET /v1/me, no App Check). */
  private async restore(): Promise<void> {
    try {
      const response = await firstValueFrom(this.api.get<ProfileResponse>('/v1/me'));
      this.profile.set(response.user);
      this.needsRetry.set(false);
      this.sessionNotice.set(null);
    } catch (error) {
      await this.handleApiFailure(error);
    } finally {
      this.ready.set(true);
    }
  }

  /** After a successful Firebase sign-in: create or refresh the profile (POST /v1/auth/sync). */
  private async sync(): Promise<void> {
    const response = await firstValueFrom(this.api.post<ProfileResponse>('/v1/auth/sync'));
    this.profile.set(response.user);
    this.needsRetry.set(false);
    this.sessionNotice.set(null);
  }

  private async runSignIn(step: () => Promise<void>): Promise<boolean> {
    if (this.busy()) {
      return false;
    }
    this.busy.set(true);
    this.signingIn = true;
    this.error.set(null);
    try {
      await step();
      await this.sync();
      return true;
    } catch (error) {
      await this.handleApiFailure(error);
      return false;
    } finally {
      this.signingIn = false;
      this.busy.set(false);
      this.ready.set(true);
    }
  }

  private async handleApiFailure(error: unknown): Promise<void> {
    this.error.set(describeError(error));
    if (error instanceof ApiError && SIGN_OUT_CODES.has(error.code)) {
      // Signed out by an error while restoring a session (not while the person was signing in): tell them, site-wide.
      if (!this.signingIn) {
        this.sessionNotice.set(describeError(error));
      }
      await this.signOut();
    } else if (error instanceof ApiError) {
      // Google, the network or the rate limiter said not now: keep the Firebase session and let the person retry.
      this.needsRetry.set(this.hasSession());
    }
  }
}
