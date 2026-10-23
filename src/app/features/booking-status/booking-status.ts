import { Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '../../core/api/api-error';
import type { BookingDetail } from '../../core/api/api-types';
import { describeError } from '../../core/api/error-messages';
import { formatIst, isFinal, noticeFor, viewOf, type StatusView } from '../../core/booking/booking-status';
import { AuthService } from '../../core/services/auth';
import { BookingModalService } from '../../core/services/booking-modal';
import { BookingsService } from '../../core/services/bookings';
import { formatRupees } from '../../core/services/packages';
import { PaymentService } from '../../core/services/payment';

/** Asks the API every 2 seconds, for at most 60 seconds (integration guide, FE-5). */
const POLL_EVERY_MS = 2_000;
const POLL_WINDOW_MS = 60_000;

/**
 * Where PayU sends the browser back to (/booking/{reference}). Nothing in the address is trusted: the page asks the API
 * what really happened, polling while the payment is being confirmed, and shows the answer. Signed-out visitors are
 * asked to sign in first (a booking belongs to its owner); signing in brings them straight back to it.
 */
@Component({
  selector: 'app-booking-status',
  imports: [RouterLink],
  template: `
    <main class="page">
      <section class="card" aria-labelledby="status-title">
        @if (!auth.ready()) {
          <div class="spinner" aria-hidden="true"></div>
          <h1 id="status-title">One moment&hellip;</h1>
          <p role="status">Checking your sign-in.</p>
        } @else if (!auth.user()) {
          <h1 id="status-title">Sign in to see this booking</h1>
          <p>A booking belongs to the person who made it. Sign in with the same account to see it.</p>
          <button type="button" class="btn" (click)="auth.openSignIn()">Log in / Sign up</button>
        } @else if (notFound()) {
          <h1 id="status-title">We cannot find this booking</h1>
          <p>Check the reference, and make sure you are signed in with the account that made the booking.</p>
          <a class="btn" routerLink="/">Back to home</a>
        } @else if (booking(); as b) {
          @if (notice(); as note) {
            <p class="notice" role="status">{{ note }}</p>
          }
          @switch (view()) {
            @case ('confirming') {
              <div class="spinner" aria-hidden="true"></div>
              <h1 id="status-title">Confirming your payment&hellip;</h1>
              <p role="status">This usually takes a few seconds. Please keep this page open.</p>
            }
            @case ('still-confirming') {
              <div class="icon wait" aria-hidden="true">&hellip;</div>
              <h1 id="status-title">Still confirming with the bank</h1>
              <p role="status">
                We are still waiting for the bank. There is nothing more for you to do: we will message you once the payment is
                confirmed. You can come back to this page any time, or look in <a routerLink="/my-bookings">My bookings</a>.
              </p>
              <button type="button" class="btn btn-quiet" (click)="checkAgain()">Check again</button>
            }
            @case ('confirmed') {
              <div class="icon ok" aria-hidden="true">&#10003;</div>
              <h1 id="status-title">You're booked</h1>
              <p role="status">
                Our experts will contact you on WhatsApp at <strong>{{ b.whatsappNumber }}</strong
                >.
              </p>
            }
            @case ('failed') {
              <div class="icon bad" aria-hidden="true">!</div>
              <h1 id="status-title">Payment did not go through</h1>
              <p role="status">Nothing was charged for this booking. You can book again whenever you are ready.</p>
              <button type="button" class="btn" (click)="bookAgain()">Book again</button>
            }
            @case ('attention') {
              <div class="icon wait" aria-hidden="true">&hellip;</div>
              <h1 id="status-title">We are checking one detail</h1>
              <p role="status">We received your payment and are checking one detail. We will contact you shortly.</p>
            }
            @case ('unpaid') {
              <div class="icon wait" aria-hidden="true">&#8377;</div>
              <h1 id="status-title">Waiting for payment</h1>
              <p role="status">This booking is saved but not paid yet.</p>
              @if (b.canPay) {
                <button type="button" class="btn" [disabled]="paying()" (click)="pay()">
                  {{ paying() ? 'Taking you to payment…' : 'Pay ' + money(b.amountPaise) }}
                </button>
              }
            }
            @case ('completed') {
              <div class="icon ok" aria-hidden="true">&#10003;</div>
              <h1 id="status-title">Consultation complete</h1>
              <p role="status">Thank you for choosing Ease Dis-ease.</p>
            }
            @case ('cancelled') {
              <div class="icon bad" aria-hidden="true">!</div>
              <h1 id="status-title">This booking was cancelled</h1>
              <button type="button" class="btn" (click)="bookAgain()">Book again</button>
            }
            @case ('expired') {
              <div class="icon bad" aria-hidden="true">!</div>
              <h1 id="status-title">This booking expired</h1>
              <p role="status">It was not paid in time. You can book again whenever you are ready.</p>
              <button type="button" class="btn" (click)="bookAgain()">Book again</button>
            }
            @case ('no-show') {
              <div class="icon bad" aria-hidden="true">!</div>
              <h1 id="status-title">This consultation was missed</h1>
              <p role="status">Please get in touch with us if you would like to arrange another.</p>
            }
          }

          @if (problem(); as text) {
            <p class="error" role="alert">{{ text }}</p>
          }

          <dl class="facts">
            <div><dt>Reference</dt><dd class="mono">{{ b.reference }}</dd></div>
            <div><dt>Consultation</dt><dd>{{ b.packageTitle }}</dd></div>
            <div><dt>Amount</dt><dd>{{ money(b.amountPaise) }}</dd></div>
            @if (b.payment?.paidAt; as paidAt) {
              <div><dt>Paid</dt><dd>{{ ist(paidAt) }}</dd></div>
            }
          </dl>
        } @else if (problem(); as text) {
          <h1 id="status-title">We could not load this booking</h1>
          <p class="error" role="alert">{{ text }}</p>
          <button type="button" class="btn" (click)="checkAgain()">Try again</button>
        } @else {
          <div class="spinner" aria-hidden="true"></div>
          <h1 id="status-title">Loading your booking&hellip;</h1>
          <p role="status">One moment.</p>
        }
      </section>
    </main>
  `,
  styles: `
    .page {
      min-height: 100dvh;
      box-sizing: border-box;
      display: grid;
      place-items: center;
      padding: calc(var(--sp-24) + env(safe-area-inset-top, 0px)) var(--sp-4) var(--sp-12);
    }
    .card {
      width: 100%;
      max-width: 520px;
      box-sizing: border-box;
      padding: var(--sp-8) var(--sp-6);
      border-radius: var(--r-lg);
      background: var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      box-shadow: 0 24px 60px -32px color-mix(in oklab, var(--oxblood-deep) 45%, transparent);
      text-align: center;
    }
    h1 {
      margin: 0 0 var(--sp-3);
      font-family: var(--font-display);
      font-weight: 400;
      font-size: var(--fs-display-s);
      line-height: 1.15;
      color: var(--ink);
    }
    p {
      margin: 0 auto var(--sp-4);
      max-width: 42ch;
      line-height: 1.55;
    }
    .notice {
      max-width: none;
      padding: 10px 14px;
      border-radius: 10px;
      background: #f3f6f8;
      font-size: 0.9rem;
      text-align: left;
    }
    .error {
      color: #b0301a;
      font-size: 0.95rem;
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto var(--sp-4);
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 30px;
      font-weight: 600;
    }
    .icon.ok {
      background: #e6f7fd;
      color: var(--oxblood);
    }
    .icon.bad {
      background: #fdf1ee;
      color: var(--ember-a);
    }
    .icon.wait {
      background: #f3f6f8;
      color: var(--oxblood);
    }
    .spinner {
      width: 44px;
      height: 44px;
      margin: 0 auto var(--sp-4);
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
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--tap-min);
      margin-top: var(--sp-2);
      padding: 0 var(--sp-6);
      border: 0;
      border-radius: var(--r-pill);
      background-image: var(--gradient-ember);
      color: var(--ivory);
      font: inherit;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
    }
    .btn-quiet {
      background: none;
      color: var(--ink);
      border: 1px solid var(--rule-on-light);
    }
    .btn:disabled {
      opacity: 0.65;
      cursor: progress;
    }
    .btn:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }
    .facts {
      margin: var(--sp-6) 0 0;
      padding-top: var(--sp-4);
      border-top: 1px solid var(--rule-on-light);
      display: grid;
      gap: var(--sp-2);
      text-align: left;
    }
    .facts div {
      display: flex;
      justify-content: space-between;
      gap: var(--sp-4);
    }
    dt {
      color: var(--text-quiet-light);
      font-size: 0.9rem;
    }
    dd {
      margin: 0;
      text-align: right;
      overflow-wrap: anywhere;
    }
    .mono {
      font-family: var(--font-mono);
      letter-spacing: 0.06em;
    }
    @media (max-width: 640px) {
      .card {
        padding: var(--sp-6) var(--sp-4);
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
export class BookingStatus {
  protected readonly auth = inject(AuthService);
  private readonly bookings = inject(BookingsService);
  private readonly payment = inject(PaymentService);
  private readonly modal = inject(BookingModalService);
  private readonly destroyRef = inject(DestroyRef);

  /** From the route (/booking/:reference), by component input binding. */
  readonly reference = input.required<string>();
  /** The `?e=` flag the payment callback may add (verify, busy, server). Only used to pick a notice. */
  readonly e = input<string | undefined>(undefined);

  protected readonly booking = signal<BookingDetail | null>(null);
  protected readonly notFound = signal(false);
  protected readonly timedOut = signal(false);
  protected readonly problem = signal<string | null>(null);
  protected readonly paying = signal(false);

  protected view(): StatusView {
    const booking = this.booking();
    return booking ? viewOf(booking, this.timedOut()) : 'confirming';
  }

  protected notice(): string | null {
    return noticeFor(this.e());
  }

  private runId = 0;
  private sleeping: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Start asking once someone is signed in (and again if the reference changes or they sign back in).
    effect(() => {
      const reference = this.reference();
      if (this.auth.user()) {
        untracked(() => void this.poll(reference));
      }
    });
    this.destroyRef.onDestroy(() => {
      this.runId++;
      clearTimeout(this.sleeping);
    });
  }

  protected money(paise: number): string {
    return formatRupees(paise);
  }

  protected ist(iso: string): string {
    return formatIst(iso);
  }

  protected checkAgain(): void {
    void this.poll(this.reference());
  }

  protected bookAgain(): void {
    this.modal.open('book');
  }

  protected async pay(): Promise<void> {
    this.paying.set(true);
    this.problem.set(null);
    try {
      await this.payment.startPayment(this.reference());
    } catch (error) {
      this.problem.set(describeError(error));
      this.paying.set(false);
    }
  }

  /** Reads the booking now, then every 2 seconds until it is final or 60 seconds have passed. A newer call replaces an older one. */
  private async poll(reference: string): Promise<void> {
    const run = ++this.runId;
    clearTimeout(this.sleeping);
    this.timedOut.set(false);
    this.notFound.set(false);
    const deadline = Date.now() + POLL_WINDOW_MS;

    while (run === this.runId) {
      let waitMs = POLL_EVERY_MS;
      try {
        const booking = await firstValueFrom(this.bookings.get(reference));
        if (run !== this.runId) {
          return;
        }
        this.booking.set(booking);
        this.problem.set(null);
        if (isFinal(booking) || (booking.status === 'PENDING_PAYMENT' && booking.payment === null)) {
          return; // decided, or nothing is being confirmed (no payment was started)
        }
      } catch (error) {
        if (run !== this.runId) {
          return;
        }
        if (error instanceof ApiError && error.code === 'BOOKING_NOT_FOUND') {
          this.notFound.set(true);
          return;
        }
        if (error instanceof ApiError && error.code === 'UNAUTHENTICATED') {
          return; // the session ended: the auth service signs out, and the sign-in prompt takes over
        }
        this.problem.set(describeError(error));
        if (error instanceof ApiError && error.code === 'RATE_LIMITED' && error.retryAfterSeconds) {
          waitMs = error.retryAfterSeconds * 1000;
        }
      }
      if (Date.now() >= deadline) {
        this.timedOut.set(true);
        return;
      }
      await new Promise<void>((resolve) => (this.sleeping = setTimeout(resolve, waitMs)));
    }
  }
}
