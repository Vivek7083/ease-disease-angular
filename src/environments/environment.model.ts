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
  /** Talk to the Firebase Auth emulator (localhost:9099) instead of Google. Local development only. */
  readonly useAuthEmulator: boolean;
  /**
   * Id of the one launch package ("One-Time Consult", created by the backend seed).
   * Used until GET /v1/packages exists (FE-1); the server takes the price from it.
   */
  readonly launchPackageId: string;
}
