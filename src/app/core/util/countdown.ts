import { DestroyRef, inject, signal } from '@angular/core';

/**
 * A whole-second countdown for "please wait" moments, such as a rate limit's Retry-After. `seconds` is 0 when there is
 * nothing to wait for, so `disabled = countdown.seconds() > 0` is all a button needs. Stops by itself when the
 * component that created it is destroyed. Create it in a field initialiser (it needs the injection context).
 */
export class Countdown {
  readonly seconds = signal(0);
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(destroyRef: DestroyRef = inject(DestroyRef)) {
    destroyRef.onDestroy(() => this.stop());
  }

  /** Starts (or restarts) counting down from `seconds`. */
  start(seconds: number): void {
    this.stop();
    this.seconds.set(Math.max(0, Math.ceil(seconds)));
    if (this.seconds() === 0) {
      return;
    }
    this.timer = setInterval(() => {
      this.seconds.update((left) => Math.max(0, left - 1));
      if (this.seconds() === 0) {
        this.stop();
      }
    }, 1000);
  }

  stop(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
