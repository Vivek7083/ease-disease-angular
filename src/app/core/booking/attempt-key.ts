/**
 * The Idempotency-Key for creating a booking (integration guide, FE-3 rule 4). One key per distinct request: the same
 * request sent again after a network error, a timeout, a 5xx, or a 429 reuses its key, so the server returns the
 * original answer instead of creating a second booking. Change anything and the key changes with it. After a 400
 * nothing was stored, so the same key may be reused.
 */
export class AttemptKey {
  private last: { fingerprint: string; key: string } | null = null;

  constructor(private readonly newKey: () => string) {}

  /** The key for this exact request: the previous one if the request is identical, else a fresh one. */
  keyFor(request: object): string {
    const fingerprint = JSON.stringify(request);
    if (this.last?.fingerprint !== fingerprint) {
      this.last = { fingerprint, key: this.newKey() };
    }
    return this.last.key;
  }

  /** Forget the key (the server said it was used for a different body, or the booking went through). */
  renew(): void {
    this.last = null;
  }
}
