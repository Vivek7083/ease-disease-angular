import type { Environment } from './environment.model';

/** Local development. The values marked PLACEHOLDER are replaced with the developer Firebase project's config. */
export const environment: Environment = {
  apiBaseUrl: '',
  firebase: {
    apiKey: 'PLACEHOLDER-firebase-web-api-key',
    authDomain: 'PLACEHOLDER.firebaseapp.com',
    // Must equal the API's FIREBASE_PROJECT_ID (its .env). Without the emulator, the other three values must come from this project's Web app config too.
    projectId: 'ease-disease-vivek',
    appId: 'PLACEHOLDER-firebase-web-app-id',
  },
  useAuthEmulator: true,
  launchPackageId: '00000000-0000-4000-8000-000000000001',
};
