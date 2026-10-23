import { Service } from '@angular/core';
import type { Auth } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { firebaseApp } from './firebase-app';

/** What the rest of the app needs to know about the Firebase user. The SDK's own User type never leaves this file. */
export interface FirebaseUserInfo {
  readonly email: string | null;
  readonly displayName: string | null;
}

/** Where the Firebase Auth emulator listens (see `useAuthEmulator` in the environment). */
const EMULATOR_URL = 'http://localhost:9099';

/**
 * The only place that touches the Firebase SDK. The SDK (about 100 kB) is
 * fetched with a dynamic import the first time it is needed, so it is a
 * separate chunk and the first paint of the Home page does not wait for it.
 * AuthService talks to this class, so tests can swap it for a fake.
 */
@Service()
export class FirebaseAuthClient {
  private sdk: Promise<{ auth: Auth; mod: typeof import('firebase/auth') }> | null = null;

  /** Subscribes to sign-in state (fires once on load with the restored session, or null, then on every change). */
  async watch(onChange: (user: FirebaseUserInfo | null) => void): Promise<void> {
    const { auth, mod } = await this.load();
    mod.onAuthStateChanged(auth, (user) => onChange(user ? { email: user.email, displayName: user.displayName } : null));
  }

  /** Must be called straight from a click, or the browser's pop-up blocker refuses the window. */
  async signInWithGoogle(): Promise<void> {
    const { auth, mod } = await this.load();
    await mod.signInWithPopup(auth, new mod.GoogleAuthProvider());
  }

  async sendEmailLink(email: string, continueUrl: string): Promise<void> {
    const { auth, mod } = await this.load();
    await mod.sendSignInLinkToEmail(auth, email, { url: continueUrl, handleCodeInApp: true });
  }

  async isEmailLink(url: string): Promise<boolean> {
    const { auth, mod } = await this.load();
    return mod.isSignInWithEmailLink(auth, url);
  }

  async completeEmailLink(email: string, url: string): Promise<void> {
    const { auth, mod } = await this.load();
    await mod.signInWithEmailLink(auth, email, url);
  }

  async signOut(): Promise<void> {
    const { auth, mod } = await this.load();
    await mod.signOut(auth);
  }

  /** The current Firebase ID token (the SDK refreshes the hourly token itself), or null when signed out. Never log or store it. */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const { auth } = await this.load();
    return auth.currentUser ? auth.currentUser.getIdToken(forceRefresh) : null;
  }

  private load() {
    this.sdk ??= (async () => {
      const [app, mod] = await Promise.all([firebaseApp(), import('firebase/auth')]);
      const auth = mod.getAuth(app);
      if (environment.useAuthEmulator) {
        mod.connectAuthEmulator(auth, EMULATOR_URL, { disableWarnings: true });
      }
      return { auth, mod };
    })();
    return this.sdk;
  }
}
