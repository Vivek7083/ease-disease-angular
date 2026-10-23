import type { FirebaseApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

let app: Promise<FirebaseApp> | null = null;

/**
 * The one Firebase app, shared by sign-in and App Check. Created on first use (the SDK is a dynamic import, so it is
 * not part of the first page load), and only once.
 */
export function firebaseApp(): Promise<FirebaseApp> {
  app ??= import('firebase/app').then(({ initializeApp }) => initializeApp(environment.firebase));
  return app;
}
