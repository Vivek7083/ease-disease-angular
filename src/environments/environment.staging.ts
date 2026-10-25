import type { Environment } from './environment.model';

export const environment: Environment = {
  // Same origin: Firebase Hosting forwards /v1/** to the API (see firebase.json), so the browser makes no cross-origin call.
  apiBaseUrl: '',
  firebase: {
    apiKey: 'AIzaSyDdVO70vy9PuuwNjwcyfZTNEbercOL_T-8',
    authDomain: 'ease-disease-staging.firebaseapp.com',
    projectId: 'ease-disease-staging',
    appId: '1:188618345109:web:8d1721844e7ca9ba62299c',
  },
  // reCAPTCHA Enterprise (Fraud Defense) site key of the staging Firebase project; a public identifier, not a secret.
  appCheck: { siteKey: '6LfAxf4tAAAAAOfXbqYGeIBRjVTlsPMrIWCXP2Se', debug: false },
  useAuthEmulator: false,
  launchPackageId: '00000000-0000-4000-8000-000000000001',
};
