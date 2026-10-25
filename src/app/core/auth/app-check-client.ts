import { Service } from '@angular/core';
import type { AppCheck } from 'firebase/app-check';
import { environment } from '../../../environments/environment';
import { firebaseApp } from './firebase-app';

/**
 * Firebase App Check: a token that tells the API a request comes from the real web app, not a script. The API asks for
 * it on sign-in sync, booking creation and checkout only. Turned on by `environment.appCheck.siteKey` (a reCAPTCHA
 * Enterprise key from the Firebase console); with no key it is off, nothing is loaded, and no header is sent (the API
 * runs with APP_CHECK_MODE=off locally). The SDK is a dynamic import, fetched only when App Check is on.
 */
@Service()
export class AppCheckClient {
  private sdk: Promise<{ appCheck: AppCheck; mod: typeof import('firebase/app-check') }> | null = null;

  get enabled(): boolean {
    return environment.appCheck.siteKey !== null;
  }

  /**
   * A current App Check token (the SDK refreshes it by itself), or null when App Check is off or no token could be
   * had. A missing token is not an error here: the request goes without the header and the API answers
   * `APP_CHECK_FAILED`, which the app already turns into "reload the page". Never log or store the token.
   */
  async token(): Promise<string | null> {
    if (!this.enabled) {
      return null;
    }
    try {
      const { appCheck, mod } = await this.load();
      return (await mod.getToken(appCheck, false)).token;
    } catch {
      return null;
    }
  }

  private load() {
    this.sdk ??= (async () => {
      const siteKey = environment.appCheck.siteKey;
      if (siteKey === null) {
        throw new Error('App Check is not configured.');
      }
      if (environment.appCheck.debug) {
        // Local development: the SDK prints a debug token in the console, to be registered in the Firebase console.
        Reflect.set(globalThis, 'FIREBASE_APPCHECK_DEBUG_TOKEN', true);
      }
      const [app, mod] = await Promise.all([firebaseApp(), import('firebase/app-check')]);
      const appCheck = mod.initializeAppCheck(app, {
        provider: new mod.ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      return { appCheck, mod };
    })();
    return this.sdk;
  }
}
