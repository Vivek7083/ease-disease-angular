import { Component, ElementRef, Injector, afterNextRender, inject, output, signal } from '@angular/core';
import { FormField, form, submit, validate, type ValidationError } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '../../../core/api/api-error';
import type { BookingCreated } from '../../../core/api/api-types';
import { describeError } from '../../../core/api/error-messages';
import { AttemptKey } from '../../../core/booking/attempt-key';
import {
  API_FIELD_TO_FORM_FIELD,
  CITY_MAX,
  CITY_MIN,
  EMAIL_MAX,
  GENDER_MAX,
  NAME_MAX,
  NAME_MIN,
  ageProblem,
  buildCreateBookingRequest,
  emailProblem,
  length,
  normalisePhone,
  textProblem,
  type BookingFormValue,
} from '../../../core/booking/booking-rules';
import { BookingModalService } from '../../../core/services/booking-modal';
import { BookingsService } from '../../../core/services/bookings';
import { PackagesService } from '../../../core/services/packages';
import { Countdown } from '../../../core/util/countdown';

const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say'] as const;

type FieldName = keyof BookingFormValue;
type ServerError = ValidationError.WithOptionalFieldTree;

/**
 * The details step of the booking dialog: who the consultation is for. Submitting creates the booking
 * (POST /v1/bookings, PENDING_PAYMENT) and tells the dialog, which moves on. The same rules as the API are checked
 * first; anything the API still refuses is shown under the field it names.
 */
@Component({
  selector: 'app-details-step',
  imports: [FormField, RouterLink],
  template: `
    <form class="bk-form" novalidate (submit)="onSubmit($event)">
      <div class="bk-body">
        <div class="bk-grid">
          <div class="bk-field bk-full">
            <label for="bk-name">Full name <span class="req" aria-hidden="true">*</span></label>
            <input
              id="bk-name"
              type="text"
              autocomplete="name"
              [formField]="f.name"
              aria-required="true"
              [attr.aria-invalid]="shown('name')"
              [attr.aria-describedby]="shown('name') ? 'bk-name-err' : null"
            />
            @if (shown('name')) {
              <p class="bk-error" id="bk-name-err">{{ message('name') }}</p>
            }
          </div>

          <div class="bk-field">
            <label for="bk-phone">WhatsApp number <span class="req" aria-hidden="true">*</span></label>
            <input
              id="bk-phone"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+91 98765 43210"
              [formField]="f.phone"
              aria-required="true"
              [attr.aria-invalid]="shown('phone')"
              aria-describedby="bk-phone-hint bk-phone-err"
            />
            <p class="bk-hint" id="bk-phone-hint">Include your country code.</p>
            @if (shown('phone')) {
              <p class="bk-error" id="bk-phone-err">{{ message('phone') }}</p>
            }
          </div>

          <div class="bk-field">
            <label for="bk-email">Email <span class="req" aria-hidden="true">*</span></label>
            <input
              id="bk-email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              [formField]="f.email"
              aria-required="true"
              [attr.aria-invalid]="shown('email')"
              [attr.aria-describedby]="shown('email') ? 'bk-email-err' : null"
            />
            @if (shown('email')) {
              <p class="bk-error" id="bk-email-err">{{ message('email') }}</p>
            }
          </div>

          <div class="bk-field">
            <label for="bk-age">Age <span class="req" aria-hidden="true">*</span></label>
            <input
              id="bk-age"
              type="number"
              inputmode="numeric"
              [formField]="f.age"
              aria-required="true"
              [attr.aria-invalid]="shown('age')"
              [attr.aria-describedby]="shown('age') ? 'bk-age-err' : null"
            />
            @if (shown('age')) {
              <p class="bk-error" id="bk-age-err">{{ message('age') }}</p>
            }
          </div>

          <div class="bk-field">
            <label for="bk-city">City <span class="req" aria-hidden="true">*</span></label>
            <input
              id="bk-city"
              type="text"
              autocomplete="address-level2"
              [formField]="f.city"
              aria-required="true"
              [attr.aria-invalid]="shown('city')"
              [attr.aria-describedby]="shown('city') ? 'bk-city-err' : null"
            />
            @if (shown('city')) {
              <p class="bk-error" id="bk-city-err">{{ message('city') }}</p>
            }
          </div>

          <div class="bk-field bk-full">
            <fieldset>
              <legend>Gender <span class="hint">(optional)</span></legend>
              <div class="bk-chips">
                @for (g of genders; track g) {
                  <label><input type="radio" [value]="g" [formField]="f.gender" /><span>{{ g }}</span></label>
                }
              </div>
            </fieldset>
            @if (shown('gender')) {
              <p class="bk-error" id="bk-gender-err">{{ message('gender') }}</p>
            }
          </div>

          <div class="bk-field bk-full">
            <label class="bk-consent">
              <input
                type="checkbox"
                [formField]="f.consent"
                aria-required="true"
                [attr.aria-invalid]="shown('consent')"
                [attr.aria-describedby]="shown('consent') ? 'bk-consent-err' : null"
              />
              <span>
                I agree that Ease Dis-ease can use this information to prepare for my consultation and contact me about it. It won't be shared with
                anyone else. Read our
                <a routerLink="/privacy" target="_blank" rel="noopener">Privacy Policy<span class="bk-sr"> (opens in a new tab)</span></a>.
              </span>
            </label>
            @if (shown('consent')) {
              <p class="bk-error" id="bk-consent-err">{{ message('consent') }}</p>
            }
          </div>
        </div>

        @if (formError(); as problem) {
          <p class="bk-banner" role="alert">
            {{ problem }}
            @if (showMyBookings()) {
              <a routerLink="/my-bookings" (click)="modal.close()">Open My bookings</a>
            }
          </p>
        }
      </div>

      <div class="bk-foot">
        <button type="submit" class="bk-btn bk-btn-primary" [disabled]="sending() || waitSeconds() > 0">
          @if (sending()) {
            Creating your booking&hellip;
          } @else if (waitSeconds() > 0) {
            Please wait {{ waitSeconds() }}s
          } @else {
            Pay {{ plan().price }}
          }
        </button>
      </div>
    </form>
  `,
  styles: `
    /* The form fills the dialog card under the header: the body scrolls and the Pay footer stays in view. */
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      font-family: var(--font-body);
      color: #000;
    }
    .bk-form {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      margin: 0;
    }
    .bk-body {
      padding: 22px 28px;
      overflow-y: auto;
      flex: 1 1 auto;
      min-height: 0;
      overscroll-behavior: contain;
    }
    .bk-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 18px;
    }
    .bk-full {
      grid-column: 1 / -1;
    }
    .bk-field label,
    .bk-field legend {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      padding: 0;
    }
    .bk-field .req {
      color: var(--ember-a);
    }
    .bk-field .hint {
      font-weight: 400;
      color: #4a5a66;
    }
    .bk-field fieldset {
      border: 0;
      margin: 0;
      padding: 0;
      min-width: 0;
    }
    input[type='text'],
    input[type='tel'],
    input[type='email'],
    input[type='number'] {
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
    [aria-invalid='true'] {
      border-color: var(--ember-a);
    }
    .bk-hint {
      margin: 6px 0 0;
      font-size: 13px;
      color: #4a5a66;
    }
    .bk-error {
      color: #b0301a;
      font-size: 13px;
      margin: 6px 0 0;
    }
    .bk-banner a {
      margin-left: 6px;
      color: var(--oxblood);
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .bk-banner {
      margin: 18px 0 0;
      padding: 10px 14px;
      border-radius: 10px;
      border-left: 3px solid var(--ember-a);
      background: #fdf1ee;
      color: #7a2412;
      font-size: 14px;
      line-height: 1.5;
    }

    .bk-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .bk-chips label {
      margin: 0;
      font-weight: 400;
    }
    .bk-chips input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    .bk-chips span {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 0 16px;
      border-radius: 999px;
      border: 1px solid #cbd5dc;
      background: #fff;
      font-size: 15px;
      cursor: pointer;
      user-select: none;
    }
    .bk-chips input:checked + span {
      background: var(--highlight-blue);
      border-color: var(--highlight-blue);
      color: #000;
    }
    .bk-chips input:focus-visible + span {
      box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.3);
    }

    .bk-field label.bk-consent {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
    }
    .bk-consent input {
      width: 20px;
      height: 20px;
      margin-top: 2px;
      accent-color: var(--oxblood);
      flex: none;
    }
    .bk-consent a {
      color: var(--oxblood);
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .bk-consent a:hover {
      text-decoration-thickness: 2px;
    }
    .bk-consent a:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
      border-radius: 2px;
    }
    /* Visually hidden, still read by screen readers. */
    .bk-sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .bk-foot {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 16px 28px 22px;
      border-top: 1px solid #e8ecef;
    }
    .bk-btn {
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
    .bk-btn-primary {
      border: 0;
      color: #fff;
      background: linear-gradient(135deg, var(--ember-a), var(--ember-b));
      box-shadow: var(--shadow-ember);
    }
    .bk-btn-primary:not(:disabled):hover {
      filter: brightness(1.05);
    }
    .bk-btn:disabled {
      opacity: 0.65;
      cursor: progress;
    }
    .bk-btn:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }

    /* Phones: one column, full-width Pay button above the home indicator. */
    @media (max-width: 640px) {
      .bk-body {
        padding: 18px;
      }
      .bk-grid {
        grid-template-columns: 1fr;
        gap: 14px;
      }
      .bk-foot {
        padding: 12px 18px calc(14px + env(safe-area-inset-bottom));
      }
      .bk-btn-primary {
        width: 100%;
      }
    }
  `,
})
export class DetailsStep {
  private readonly bookings = inject(BookingsService);
  protected readonly modal = inject(BookingModalService);
  private readonly packages = inject(PackagesService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** The booking was created (status PENDING_PAYMENT). */
  readonly created = output<BookingCreated>();

  protected readonly plan = this.packages.plan;
  protected readonly genders = GENDERS;
  protected readonly sending = signal(false);
  /** A problem that does not belong to one field (network, rate limit, package off sale, ...). */
  protected readonly formError = signal<string | null>(null);
  /** A rate-limit wait; Pay is disabled until it reaches 0. */
  private readonly wait = new Countdown();
  protected readonly waitSeconds = this.wait.seconds;
  /** True when the message is about unpaid bookings, where the way forward is My bookings. */
  protected readonly showMyBookings = signal(false);

  private readonly attemptKey = new AttemptKey(() => crypto.randomUUID());

  private readonly model = signal<BookingFormValue>({
    name: '',
    // Pre-filled so the country code is hard to forget; a bare 10-digit Indian number also works.
    phone: '+91 ',
    email: '',
    age: null,
    city: '',
    gender: '',
    consent: false,
  });

  protected readonly f = form(this.model, (path) => {
    validate(path.name, ({ value }) => problem('name', textProblem(value(), 'Name', NAME_MIN, NAME_MAX)));
    validate(path.phone, ({ value }) =>
      problem('phone', normalisePhone(value()) ? null : 'Enter the number with its country code, for example +91 98765 43210.'),
    );
    validate(path.email, ({ value }) => {
      const found = emailProblem(value());
      if (found === 'too-long') {
        return problem('email', `Email can be at most ${EMAIL_MAX} characters.`);
      }
      return problem('email', found ? 'Enter a valid email address, like you@example.com.' : null);
    });
    validate(path.age, ({ value }) => problem('age', ageProblem(value())));
    validate(path.city, ({ value }) => problem('city', textProblem(value(), 'City', CITY_MIN, CITY_MAX)));
    validate(path.gender, ({ value }) => problem('gender', length(value()) > GENDER_MAX ? `Gender can be at most ${GENDER_MAX} characters.` : null));
    validate(path.consent, ({ value }) => problem('consent', value() ? null : 'Please tick to continue.'));
  });

  /** True when this field's complaint should show: it is invalid and was touched (submitting touches everything). */
  protected shown(name: FieldName): boolean {
    const state = this.f[name]();
    return state.invalid() && state.touched();
  }

  protected message(name: FieldName): string {
    return this.f[name]().errors()[0]?.message ?? 'Please check this field.';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.sending() || this.waitSeconds() > 0) {
      return;
    }
    this.formError.set(null);
    this.showMyBookings.set(false);
    await submit(this.f, {
      action: () => this.send(),
      onInvalid: () => this.focusFirstProblem(),
    });
  }

  /** Creates the booking. Returns the API's field complaints (shown under the fields), or nothing on success or a general failure. */
  private async send(): Promise<ServerError[] | undefined> {
    const request = buildCreateBookingRequest(this.model(), this.packages.packageId());
    this.sending.set(true);
    try {
      const booking = await this.createOnce(request);
      this.attemptKey.renew();
      this.created.emit(booking);
      return undefined;
    } catch (error) {
      return this.handleFailure(error);
    } finally {
      this.sending.set(false);
    }
  }

  /** One attempt. If the API says the key was used for a different body, make a new key and try once more. */
  private async createOnce(request: ReturnType<typeof buildCreateBookingRequest>): Promise<BookingCreated> {
    try {
      return await firstValueFrom(this.bookings.create(request, this.attemptKey.keyFor(request)));
    } catch (error) {
      if (error instanceof ApiError && error.code === 'IDEMPOTENCY_CONFLICT') {
        this.attemptKey.renew();
        return firstValueFrom(this.bookings.create(request, this.attemptKey.keyFor(request)));
      }
      throw error;
    }
  }

  private handleFailure(error: unknown): ServerError[] | undefined {
    if (error instanceof ApiError) {
      if (error.code === 'PACKAGE_NOT_FOUND' || error.code === 'PACKAGE_NOT_ACTIVE') {
        this.packages.reload();
      }
      this.showMyBookings.set(error.code === 'TOO_MANY_PENDING_BOOKINGS');
      if (error.code === 'RATE_LIMITED' && error.retryAfterSeconds) {
        this.wait.start(error.retryAfterSeconds);
      }
      const fields = error.fieldErrors;
      if (fields) {
        const onFields: ServerError[] = [];
        let other = false;
        for (const [apiField, text] of Object.entries(fields)) {
          const formField = API_FIELD_TO_FORM_FIELD[apiField];
          if (formField) {
            onFields.push({ kind: 'server', message: text, fieldTree: this.f[formField] });
          } else {
            other = true;
            if (apiField === 'packageId') {
              this.packages.reload();
            }
          }
        }
        // A complaint about something the person cannot edit (the package, a header) gets the general message.
        if (other || onFields.length === 0) {
          this.formError.set(describeError(new ApiError(other && fields['packageId'] ? 'PACKAGE_NOT_ACTIVE' : 'UNKNOWN', '', error.status, error.requestId)));
        }
        if (onFields.length > 0) {
          this.focusFirstProblem();
        }
        return onFields.length > 0 ? onFields : undefined;
      }
    }
    this.formError.set(describeError(error));
    return undefined;
  }

  private focusFirstProblem(): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
  }
}

/** The shape `validate()` wants: nothing for "fine", an error with a message otherwise. */
function problem(kind: string, message: string | null): { kind: string; message: string } | null {
  return message ? { kind, message } : null;
}
