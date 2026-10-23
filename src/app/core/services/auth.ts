import { Service, isDevMode, signal } from '@angular/core';

export interface SignedInUser {
  readonly email: string;
  readonly name: string | null;
}

/**
 * PLACEHOLDER until FE-2 (see docs/plans/2026-10-23-backend-integration-plan.md):
 * this only holds the state the navbar reads, and nobody can really sign in
 * yet. FE-2 replaces the body with Firebase sign-in plus /v1/auth/sync, and
 * keeps these signal names (`ready`, `user`) so the navbar needs no change.
 *
 * Dev-only preview: open any page with `?as=user` to see the signed-in navbar
 * (account menu, My bookings link), `?as=out` to go back. Removed in FE-2.
 */
@Service()
export class AuthService {
  /** True once the first sign-in check finished; the navbar shows neither state until then. */
  readonly ready = signal(true);
  readonly user = signal<SignedInUser | null>(null);

  constructor() {
    if (isDevMode() && typeof window !== 'undefined') {
      const preview = new URLSearchParams(window.location.search).get('as');
      if (preview === 'user') {
        this.user.set({ email: 'priya@example.com', name: 'Priya Sharma' });
      }
    }
  }

  /** FE-2/FE-3a: opens the sign-in dialog. Does nothing yet. */
  openSignIn(): void {}

  /** FE-2: signs out of Firebase. Only clears the placeholder state for now. */
  signOut(): void {
    this.user.set(null);
  }
}
