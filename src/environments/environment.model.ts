export interface Environment {
  /** Origin of the API. '' means same origin: the dev server proxies /v1 (see proxy.conf.json). */
  readonly apiBaseUrl: string;
  /** Firebase Web app config. These are public identifiers, not secrets. */
  readonly firebase: {
    readonly apiKey: string;
    readonly authDomain: string;
    readonly projectId: string;
    readonly appId: string;
  };
  /**
   * Firebase App Check (bot protection the API asks for on sign-in sync, booking creation and checkout).
   * `siteKey` is a reCAPTCHA Enterprise key from the Firebase console; null means App Check is off and no header is sent
   * (right for local development, where the API runs with APP_CHECK_MODE=off). `debug` makes the SDK print a debug token
   * to register in the Firebase console, so App Check can be tried from localhost.
   */
  readonly appCheck: {
    readonly siteKey: string | null;
    readonly debug: boolean;
  };
  /** Talk to the Firebase Auth emulator (localhost:9099) instead of Google. Local development only. */
  readonly useAuthEmulator: boolean;
  /**
   * Id of the one launch package ("One-Time Consult", created by the backend seed).
   * Used until GET /v1/packages exists (FE-1); the server takes the price from it.
   */
  readonly launchPackageId: string;
}
