import type { Environment } from './environment.model';

/** Local development, against the developer Firebase project (its Web app config; these are public identifiers, not secrets). */
export const environment: Environment = {
  apiBaseUrl: '',
  firebase: {
    apiKey: 'AIzaSyCa2zdel1lMIk7n7UJldwm3xLFvdmOi5Oc',
    authDomain: 'ease-disease-vivek.firebaseapp.com',
    // Must equal the API's FIREBASE_PROJECT_ID (its .env).
    projectId: 'ease-disease-vivek',
    appId: '1:623191254837:web:4b1f842af450ffe1084e7c',
  },
  // null = App Check off (the API runs with APP_CHECK_MODE=off locally). To try it: enable App Check for this web app in the
  // Firebase console with a reCAPTCHA Enterprise key, put the key here, and register the debug token the console prints.
  appCheck: { siteKey: null, debug: true },
  useAuthEmulator: false,
  launchPackageId: '00000000-0000-4000-8000-000000000001',
};
