import type { Environment } from './environment.model';

export const environment: Environment = {
  apiBaseUrl: 'https://api-staging.easedisease.in',
  firebase: {
    apiKey: 'PLACEHOLDER-firebase-web-api-key',
    authDomain: 'PLACEHOLDER.firebaseapp.com',
    projectId: 'PLACEHOLDER-staging-project-id',
    appId: 'PLACEHOLDER-firebase-web-app-id',
  },
  // null = App Check off. Before staging or production (where the API enforces App Check), create a reCAPTCHA Enterprise key
  // in the Firebase console, register this web app for App Check, and put the key here.
  appCheck: { siteKey: null, debug: false },
  useAuthEmulator: false,
  launchPackageId: '00000000-0000-4000-8000-000000000001',
};
