import { Component, ElementRef, Injector, afterNextRender, inject, input, signal } from '@angular/core';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { BookingModalService, type BookingMode } from '../../../core/services/booking-modal';

/**
 * The sign-in step of the booking dialog. One step for both new and returning
 * people: Google, or an emailed link, and the account is created the first
 * time. The dialog shell moves on by itself when AuthService has a user.
 */
@Component({
  selector: 'app-sign-in-step',
  imports: [FormField, RouterLink],
  template: `
    @if (auth.needsRetry()) {
      <div class="notice" role="alert">
        <p>We could not confirm your sign-in just now.</p>
        <button type="button" class="btn btn-quiet" (click)="auth.retry()">Try again</button>
      </div>
    }

    <p class="lead">
      @if (mode() === 'book') {
        Sign in or create your account to book. It takes a few seconds, and you do not need a password.
      } @else {
        Log in, or sign up if you are new. It is the same quick step, and you do not need a password.
      }
    </p>

    @if (sentTo(); as address) {
      <div class="sent" role="status">
        <h3>Check your inbox</h3>
        <p>
          We sent a sign-in link to <strong>{{ address }}</strong
          >. Open it on this device to finish. If you cannot see it, look in your spam folder.
        </p>
        <div class="row">
          <button type="button" class="btn btn-quiet" [disabled]="auth.busy()" (click)="resend(address)">Send it again</button>
          <button type="button" class="btn btn-quiet" (click)="sentTo.set(null)">Use a different email</button>
        </div>
        @if (auth.error(); as problem) {
          <p class="error" role="alert">{{ problem }}</p>
        }
      </div>
    } @else {
      <button type="button" class="btn btn-google" data-autofocus [disabled]="auth.busy()" (click)="google()">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2.1 5-4.4 6.5v5.4h7.1c4.2-3.8 6.6-9.5 6.6-15.9z" />
          <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.4c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.6C8.1 41.1 15.5 46 24 46z" />
          <path fill="#FBBC05" d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3 .7-4.4v-5.6H4.5C3 17 2 20.4 2 24s1 7 2.5 10l7.3-5.6z" />
          <path fill="#EA4335" d="M24 10.6c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14l7.3 5.6c1.7-5.2 6.5-9 12.2-9z" />
        </svg>
        <span>{{ auth.busy() ? 'Signing in…' : 'Continue with Google' }}</span>
      </button>

      <div class="or" aria-hidden="true"><span>or</span></div>

      <form (submit)="onSubmit($event)" novalidate>
        <label for="si-email">Email</label>
        <input
          id="si-email"
          type="email"
          autocomplete="email"
          inputmode="email"
          placeholder="you@example.com"
          [formField]="emailForm.email"
          [attr.aria-invalid]="showError()"
          aria-describedby="si-email-hint si-email-error"
        />
        @if (showError()) {
          <p class="error" id="si-email-error">{{ errorText() }}</p>
        }
        <p class="hint" id="si-email-hint">We will email you a link. No password needed.</p>
        <button type="submit" class="btn btn-primary" [disabled]="auth.busy()">Email me a sign-in link</button>
      </form>

      @if (auth.error(); as problem) {
        <p class="error" role="alert">{{ problem }}</p>
      }
    }

    <p class="fine">
      Your details are used to prepare for your consultation. Read our
      <a routerLink="/privacy" target="_blank" rel="noopener">Privacy Policy<span class="sr"> (opens in a new tab)</span></a>.
    </p>
  `,
  styles: `
    /* Fills the dialog card under the header and scrolls on its own, like the booking form's body. */
    :host {
      display: block;
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 22px 28px 26px;
      font-family: var(--font-body);
      color: #000;
    }
    .lead {
      margin: 0 0 18px;
      font-size: 16px;
      line-height: 1.55;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      min-height: 48px;
      padding: 0 24px;
      border-radius: 999px;
      font: inherit;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid #cbd5dc;
      background: #fff;
      color: #000;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: progress;
    }
    .btn-primary {
      border: 0;
      color: #fff;
      background: linear-gradient(135deg, var(--ember-a), var(--ember-b));
      box-shadow: var(--shadow-ember);
    }
    .btn-primary:not(:disabled):hover {
      filter: brightness(1.05);
    }
    .btn-google:not(:disabled):hover,
    .btn-quiet:not(:disabled):hover {
      border-color: var(--oxblood);
    }
    .btn-quiet {
      width: auto;
      min-height: 44px;
      font-size: 15px;
    }
    .btn:focus-visible,
    input:focus-visible,
    a:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }
    .or {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 18px 0;
      color: #4a5a66;
      font-size: 14px;
    }
    .or::before,
    .or::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e8ecef;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 14px;
      font-weight: 500;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      min-height: 46px;
      padding: 10px 14px;
      border: 1px solid #cbd5dc;
      border-radius: 12px;
      background: #fff;
      color: #000;
      font: inherit;
      font-size: 16px; /* 16px stops phones zooming in */
    }
    input:focus {
      outline: none;
      border-color: var(--highlight-blue);
      box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.2);
    }
    input[aria-invalid='true'] {
      border-color: var(--ember-a);
    }
    .hint {
      margin: 0 0 8px;
      font-size: 13px;
      color: #4a5a66;
    }
    .error {
      margin: 6px 0 0;
      font-size: 13px;
      color: #b0301a;
    }
    .notice {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      padding: 10px 12px;
      border-radius: 10px;
      background: #f3f6f8;
      font-size: 14px;
    }
    .notice p {
      margin: 0;
    }
    .sent h3 {
      margin: 0 0 8px;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 22px;
    }
    .sent p {
      margin: 0 0 14px;
      line-height: 1.55;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .fine {
      margin: 22px 0 0;
      font-size: 13px;
      line-height: 1.5;
      color: #4a5a66;
    }
    .fine a {
      color: var(--oxblood);
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    @media (max-width: 640px) {
      :host {
        padding: 18px 18px calc(22px + env(safe-area-inset-bottom, 0px));
      }
      .btn-quiet {
        flex: 1 1 100%;
      }
    }
  `,
})
export class SignInStep {
  protected readonly auth = inject(AuthService);
  private readonly modal = inject(BookingModalService);

  readonly mode = input<BookingMode>('book');

  /** The address a sign-in link was just sent to, while the "check your inbox" message shows. */
  protected readonly sentTo = signal<string | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // The step arrives after the dialog opens (it loads on demand), so it puts focus on its own first button.
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true }), {
      injector: inject(Injector),
    });
  }

  private readonly model = signal({ email: '' });
  protected readonly emailForm = form(this.model, (path) => {
    required(path.email, { message: 'Enter your email address.' });
    email(path.email, { message: 'Enter a valid email address, like you@example.com.' });
  });

  protected showError(): boolean {
    const field = this.emailForm.email();
    return field.invalid() && field.touched();
  }

  protected errorText(): string {
    return this.emailForm.email().errors()[0]?.message ?? 'Enter a valid email address.';
  }

  /** Straight from the click, so the pop-up blocker lets the Google window open. */
  protected google(): void {
    void this.auth.signInWithGoogle();
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.emailForm, async () => {
      await this.send(this.model().email.trim());
    });
  }

  protected resend(address: string): Promise<void> {
    return this.send(address);
  }

  private async send(address: string): Promise<void> {
    const next = `${window.location.pathname}${window.location.search}`;
    const sent = await this.auth.sendEmailLink(address, next);
    if (sent) {
      // The link opens a fresh page, where this dialog is gone: remember whether the person was booking.
      this.modal.rememberBookIntent(this.mode() === 'book');
      this.sentTo.set(address);
    }
  }
}
