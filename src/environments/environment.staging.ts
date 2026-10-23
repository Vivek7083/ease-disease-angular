import type { Environment } from './environment.model';

export const environment: Environment = {
  apiBaseUrl: 'https://api-staging.easedisease.in',
  firebase: {
    apiKey: 'PLACEHOLDER-firebase-web-api-key',
    authDomain: 'PLACEHOLDER.firebaseapp.com',
    projectId: 'PLACEHOLDER-staging-project-id',
    appId: 'PLACEHOLDER-firebase-web-app-id',
  },
  useAuthEmulator: false,
  launchPackageId: '00000000-0000-4000-8000-000000000001',
};
