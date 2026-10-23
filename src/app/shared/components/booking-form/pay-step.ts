import { Component, inject, input, signal } from '@angular/core';
import { ApiError } from '../../../core/api/api-error';
import type { BookingCreated } from '../../../core/api/api-types';
import { describeError } from '../../../core/api/error-messages';
import { formatRupees } from '../../../core/services/packages';
import { PaymentService } from '../../../core/services/payment';
import { Countdown } from '../../../core/util/countdown';

/** Answers where trying again cannot help (the booking is not payable, or this number cannot be paid for online yet). */
const FINAL_CODES = new Set(['BOOKING_NOT_PAYABLE', 'BOOKING_NOT_FOUND', 'PAYMENT_PHONE_UNSUPPORTED']);

/**
 * The last step of the booking dialog: the booking exists, so go straight to payment. Shows "Taking you to payment"
 * while the checkout form is fetched and the browser is handed to PayU. If that fails, the booking is still saved:
 * say what happened and offer to try again on the SAME booking (never a second one).
 */
@Component({
  selector: 'app-pay-step',
  host: { '(window:pageshow)': 'onPageShow($event)' },
  template: `
    <div class="bk-body">
      <div class="done" #done tabindex="-1">
        @switch (state()) {
          @case ('starting') {
            <div class="spinner" aria-hidden="true"></div>
            <h3>Taking you to payment&hellip;</h3>
            <p role="status">Please do not close this window. You will be sent to our payment partner, PayU, to pay {{ amount() }}.</p>
          }
          @case ('failed') {
            <div class="icon" aria-hidden="true">!</div>
            <h3>Payment did not start</h3>
            <p role="alert">{{ problem() }}</p>
          }
          @case ('back') {
            <div class="icon" aria-hidden="true">!</div>
            <h3>Payment not completed</h3>
            <p role="status">You came back before paying. Your booking is saved, so you can pay now.</p>
          }
        }
        <p class="ref">{{ booking().reference }}</p>
        <p class="meta">{{ booking().packageTitle }} &middot; {{ amount() }}</p>
        @if (state() !== 'starting') {
          @if (canRetry()) {
            <button type="button" class="btn" [disabled]="waitSeconds() > 0" (click)="start()">
              @if (waitSeconds() > 0) {
                Please wait {{ waitSeconds() }}s
              } @else {
                Try payment again
              }
            </button>
          }
          <p class="later">Your booking is saved with reference {{ booking().reference }}.</p>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      font-family: var(--font-body);
      color: #000;
    }
    .bk-body {
      padding: 22px 28px 28px;
      overflow-y: auto;
      flex: 1 1 auto;
      min-height: 0;
    }
    .done {
      text-align: center;
      padding: 18px 6px 6px;
      outline: none;
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 14px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #fdf1ee;
      color: var(--ember-a);
      font-size: 30px;
      font-weight: 600;
    }
    .spinner {
      width: 44px;
      height: 44px;
      margin: 0 auto 18px;
      border-radius: 50%;
      border: 3px solid #e8ecef;
      border-top-color: var(--oxblood);
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    h3 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 26px;
      margin: 0 0 10px;
    }
    p {
      margin: 0 auto 8px;
      max-width: 42ch;
      line-height: 1.55;
    }
    .ref {
      margin-top: 18px;
      font-family: var(--font-mono);
      font-size: 18px;
      letter-spacing: 0.08em;
    }
    .meta,
    .later {
      font-size: 14px;
      color: #4a5a66;
    }
    .later {
      margin-top: 16px;
    }
    .btn {
      min-height: 48px;
      margin-top: 14px;
      padding: 0 28px;
      border: 0;
      border-radius: 999px;
      font: inherit;
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      background: linear-gradient(135deg, var(--ember-a), var(--ember-b));
      box-shadow: var(--shadow-ember);
      cursor: pointer;
    }
    .btn:disabled {
      opacity: 0.65;
      cursor: progress;
    }
    .btn:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }
    @media (max-width: 640px) {
      .bk-body {
        padding: 18px 18px calc(22px + env(safe-area-inset-bottom, 0px));
      }
      .btn {
        width: 100%;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }
  `,
})
export class PayStep {
  private readonly payment = inject(PaymentService);

  readonly booking = input.required<BookingCreated>();

  protected readonly state = signal<'starting' | 'failed' | 'back'>('starting');
  protected readonly problem = signal('');
  protected readonly canRetry = signal(true);
  private readonly wait = new Countdown();
  protected readonly waitSeconds = this.wait.seconds;

  constructor() {
    // The booking was just created: go straight to payment.
    queueMicrotask(() => void this.start());
  }

  protected amount(): string {
    return formatRupees(this.booking().amountPaise);
  }

  protected async start(): Promise<void> {
    this.state.set('starting');
    try {
      await this.payment.startPayment(this.booking().reference);
      // The browser is leaving for PayU; the "taking you to payment" message stays up until the page is replaced.
    } catch (error) {
      this.state.set('failed');
      this.problem.set(describeError(error) ?? 'Something went wrong. Please try again.');
      this.canRetry.set(!(error instanceof ApiError && FINAL_CODES.has(error.code)));
      if (error instanceof ApiError && error.code === 'RATE_LIMITED' && error.retryAfterSeconds) {
        this.wait.start(error.retryAfterSeconds);
      }
    }
  }

  /** The browser's Back button can restore this page from its cache after PayU: nothing was paid, so offer to pay. */
  protected onPageShow(event: PageTransitionEvent): void {
    if (event.persisted) {
      this.state.set('back');
      this.canRetry.set(true);
    }
  }
}
