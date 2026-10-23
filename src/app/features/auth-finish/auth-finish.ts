import { Component, inject, input, signal } from '@angular/core';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService, safeNext } from '../../core/services/auth';
import { BookingModalService } from '../../core/services/booking-modal';

type Stage = 'working' | 'needs-email' | 'failed' | 'not-a-link';

/**
 * Where the email sign-in link lands (/auth/finish?next=...). Finishes the
 * sign-in and moves on to `next`. If the link is opened in another browser or
 * a mail app, the remembered email is missing, so the person types it again.
 */
@Component({
  selector: 'app-auth-finish',
  imports: [FormField, RouterLink],
  template: `
    <main class="finish">
      <section class="card" aria-labelledby="finish-title">
        @switch (stage()) {
          @case ('working') {
            <h1 id="finish-title">Signing you in&hellip;</h1>
            <p role="status">One moment while we confirm your email link.</p>
          }
          @case ('needs-email') {
            <h1 id="finish-title">Confirm your email</h1>
            <p>You opened this link in a different browser, so please type the email address the link was sent to.</p>
            <form (submit)="onSubmit($event)" novalidate>
              <label for="finish-email">Email</label>
              <input
                id="finish-email"
                type="email"
                autocomplete="email"
                [formField]="emailForm.email"
                [attr.aria-invalid]="showEmailError()"
                aria-describedby="finish-email-error"
              />
              @if (showEmailError()) {
                <p class="error" id="finish-email-error">{{ emailMessage() }}</p>
              }
              @if (auth.error(); as problem) {
                <p class="error" role="alert">{{ problem }}</p>
              }
              <button type="submit" class="btn" [disabled]="auth.busy()">Continue</button>
            </form>
          }
          @case ('failed') {
            <h1 id="finish-title">We could not sign you in</h1>
            <p class="error" role="alert">{{ auth.error() ?? 'Something went wrong. Please try again.' }}</p>
            <a class="btn" routerLink="/">Back to home</a>
          }
          @case ('not-a-link') {
            <h1 id="finish-title">This link does not look right</h1>
            <p>Open the sign-in link from your email again, or request a new one.</p>
            <a class="btn" routerLink="/">Back to home</a>
          }
        }
      </section>
    </main>
  `,
  styles: `
    .finish {
      min-height: 100dvh;
      box-sizing: border-box;
      display: grid;
      place-items: center;
      padding: calc(var(--sp-24) + env(safe-area-inset-top, 0px)) var(--sp-4) var(--sp-12);
    }
    .card {
      width: 100%;
      max-width: 460px;
      box-sizing: border-box;
      padding: var(--sp-8) var(--sp-6);
      border-radius: var(--r-lg);
      background: var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      box-shadow: 0 24px 60px -32px color-mix(in oklab, var(--oxblood-deep) 45%, transparent);
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
      margin: 0 0 var(--sp-4);
      font-size: 1rem;
      line-height: 1.5;
      color: var(--ink);
    }
    form {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
    }
    label {
      font-weight: 500;
      font-size: 0.95rem;
    }
    input {
      min-height: var(--tap-min);
      padding: 0 var(--sp-4);
      border-radius: var(--r-sm);
      border: 1px solid var(--rule-on-light);
      font: inherit;
      color: var(--ink);
      background: var(--surface-card-light);
    }
    input:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    input[aria-invalid='true'] {
      border-color: var(--ember-a);
    }
    .error {
      margin: 0;
      font-size: 0.9rem;
      color: var(--ember-a);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--tap-min);
      margin-top: var(--sp-3);
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
    .btn:disabled {
      opacity: 0.6;
      cursor: progress;
    }
    @media (max-width: 640px) {
      .btn {
        width: 100%;
      }
    }
  `,
})
export class AuthFinish {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly bookingModal = inject(BookingModalService);

  /** From the link's `?next=` (component input binding). Only an internal path is ever followed. */
  readonly next = input<string | undefined>(undefined);

  protected readonly stage = signal<Stage>('working');
  private readonly model = signal({ email: '' });
  protected readonly emailForm = form(this.model, (path) => {
    required(path.email, { message: 'Enter the email address the link was sent to.' });
    email(path.email, { message: 'Enter a valid email address.' });
  });

  constructor() {
    void this.finish();
  }

  protected showEmailError(): boolean {
    const field = this.emailForm.email();
    return field.invalid() && field.touched();
  }

  protected emailMessage(): string {
    return this.emailForm.email().errors()[0]?.message ?? 'Enter a valid email address.';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.emailForm, async () => {
      await this.complete(this.model().email);
    });
  }

  private async finish(): Promise<void> {
    if (!(await this.auth.isEmailLink(window.location.href))) {
      this.stage.set('not-a-link');
      return;
    }
    await this.complete();
  }

  private async complete(typedEmail?: string): Promise<void> {
    const result = await this.auth.finishEmailLink(window.location.href, typedEmail);
    if (result === 'done') {
      await this.router.navigateByUrl(safeNext(this.next()), { replaceUrl: true });
      // They left the booking dialog for their inbox: bring it back on the details step.
      if (this.bookingModal.consumeBookIntent()) {
        this.bookingModal.open('book');
      }
    } else {
      this.stage.set(result);
    }
  }
}
