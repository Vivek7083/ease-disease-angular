import type { Environment } from './environment.model';

/** Local development. The values marked PLACEHOLDER are replaced with the developer Firebase project's config. */
export const environment: Environment = {
  apiBaseUrl: '',
  firebase: {
    apiKey: 'PLACEHOLDER-firebase-web-api-key',
    authDomain: 'PLACEHOLDER.firebaseapp.com',
    // Must equal the API's FIREBASE_PROJECT_ID. A "demo-" id works with the Auth emulator without a real project.
    projectId: 'demo-ease-disease',
    appId: 'PLACEHOLDER-firebase-web-app-id',
  },
  useAuthEmulator: true,
  launchPackageId: '00000000-0000-4000-8000-000000000001',
};
