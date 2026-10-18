import { Component, ElementRef, Injector, afterNextRender, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingModalService } from '../../../core/services/booking-modal';

const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say'] as const;

const notBlank = (c: AbstractControl): ValidationErrors | null => (String(c.value ?? '').trim() ? null : { required: true });
const email = (c: AbstractControl): ValidationErrors | null =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(c.value ?? '').trim()) ? null : { email: true };
const phone = (c: AbstractControl): ValidationErrors | null =>
  String(c.value ?? '').replace(/\D/g, '').length >= 10 ? null : { phone: true };
const age = (c: AbstractControl): ValidationErrors | null => {
  const n = Number(c.value);
  return Number.isInteger(n) && n >= 1 && n <= 120 ? null : { age: true };
};

const makeForm = () =>
  new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [notBlank] }),
    phone: new FormControl('', { nonNullable: true, validators: [phone] }),
    email: new FormControl('', { nonNullable: true, validators: [email] }),
    age: new FormControl('', { nonNullable: true, validators: [age] }),
    city: new FormControl('', { nonNullable: true, validators: [notBlank] }),
    gender: new FormControl('', { nonNullable: true }),
    consent: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

type FieldName = keyof ReturnType<typeof makeForm>['controls'];

/**
 * The on-site booking form: a pop-up on desktop and a full-screen sheet on
 * phones. For now it is ONE short step (name, WhatsApp, email, age, city,
 * optional gender, and the consent tick-box that links to the Privacy Policy),
 * followed by a thank-you screen. The health and lifestyle questions are
 * planned for AFTER the booking flow; the earlier three-step version is kept
 * in docs/reference/booking-form-three-step.ts.txt.
 *
 * DEMO MODE: nothing is sent anywhere and the payment button only shows a
 * note. Email delivery (Web3Forms) and the payment link (Razorpay) are
 * deliberately not wired up yet - see submit() and continueToPayment().
 */
@Component({
  selector: 'app-booking-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <dialog
      #dlg
      class="bk-dialog"
      aria-labelledby="bk-title"
      (close)="onNativeClose()"
      (click)="onDialogClick($event)"
    >
      <div class="bk">
        <button type="button" class="bk-close" aria-label="Close booking form" (click)="modal.close()">&times;</button>

        <div class="bk-head">
          <div class="bk-eyebrow">The E.A.S.E. Root Cause Assessment · 30 min</div>
          <h2 class="bk-title" id="bk-title">{{ submitted() ? "You're almost booked" : 'Tell us a little about you' }}</h2>
        </div>

        <form class="bk-form" [formGroup]="form" novalidate (ngSubmit)="onSubmit()">
          <div class="bk-body">
            @if (!submitted()) {
              <div class="bk-grid">
                <div class="bk-field bk-full">
                  <label for="bk-name">Full name <span class="req" aria-hidden="true">*</span></label>
                  <input id="bk-name" type="text" autocomplete="name" formControlName="name" required [attr.aria-invalid]="invalid('name')" aria-describedby="bk-name-err" />
                  @if (invalid('name')) { <p class="bk-error" id="bk-name-err">Please fill this in.</p> }
                </div>
                <div class="bk-field">
                  <label for="bk-phone">WhatsApp number <span class="req" aria-hidden="true">*</span></label>
                  <input id="bk-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+91 98765 43210" formControlName="phone" required [attr.aria-invalid]="invalid('phone')" aria-describedby="bk-phone-err" />
                  @if (invalid('phone')) { <p class="bk-error" id="bk-phone-err">Enter a valid phone number, e.g. +91 98765 43210.</p> }
                </div>
                <div class="bk-field">
                  <label for="bk-email">Email <span class="req" aria-hidden="true">*</span></label>
                  <input id="bk-email" type="email" autocomplete="email" placeholder="you@example.com" formControlName="email" required [attr.aria-invalid]="invalid('email')" aria-describedby="bk-email-err" />
                  @if (invalid('email')) { <p class="bk-error" id="bk-email-err">Enter a valid email address.</p> }
                </div>
                <div class="bk-field">
                  <label for="bk-age">Age <span class="req" aria-hidden="true">*</span></label>
                  <input id="bk-age" type="number" inputmode="numeric" min="1" max="120" formControlName="age" required [attr.aria-invalid]="invalid('age')" aria-describedby="bk-age-err" />
                  @if (invalid('age')) { <p class="bk-error" id="bk-age-err">Enter your age in years.</p> }
                </div>
                <div class="bk-field">
                  <label for="bk-city">City <span class="req" aria-hidden="true">*</span></label>
                  <input id="bk-city" type="text" autocomplete="address-level2" formControlName="city" required [attr.aria-invalid]="invalid('city')" aria-describedby="bk-city-err" />
                  @if (invalid('city')) { <p class="bk-error" id="bk-city-err">Please fill this in.</p> }
                </div>
                <div class="bk-field bk-full">
                  <fieldset>
                    <legend>Gender <span class="hint">(optional)</span></legend>
                    <div class="bk-chips">
                      @for (g of genders; track g) {
                        <label><input type="radio" name="gender" formControlName="gender" [value]="g" /><span>{{ g }}</span></label>
                      }
                    </div>
                  </fieldset>
                </div>
                <div class="bk-field bk-full">
                  <label class="bk-consent">
                    <input type="checkbox" formControlName="consent" required [attr.aria-invalid]="invalid('consent')" aria-describedby="bk-consent-err" />
                    <span>
                      I agree that Ease Dis-ease can use this information to prepare for my consultation and contact me about it. It won't be shared with
                      anyone else. Read our
                      <a routerLink="/privacy" target="_blank" rel="noopener">Privacy Policy<span class="bk-sr"> (opens in a new tab)</span></a>.
                    </span>
                  </label>
                  @if (invalid('consent')) { <p class="bk-error" id="bk-consent-err">Please tick to continue.</p> }
                </div>
              </div>
            } @else {
              <div class="bk-done" #done tabindex="-1">
                <div class="bk-done-icon" aria-hidden="true">&#10003;</div>
                <h3>Thank you, {{ firstName() }}</h3>
                <p>We've received your details. One last step: confirm your E.A.S.E. Root Cause Assessment (30 minutes).</p>
                <p class="bk-price"><s>₹5,000</s> ₹2,499</p>
                @if (demoNote()) { <p class="bk-demo" role="status">{{ demoNote() }}</p> }
              </div>
            }
          </div>

          <div class="bk-foot">
            <button type="submit" class="bk-btn bk-btn-primary">{{ submitted() ? 'Continue to payment' : 'Submit' }}</button>
          </div>
        </form>
      </div>
    </dialog>
  `,
  styles: `
    /* The dialog is a transparent full-screen frame; clicks on it (outside the
       white card) close the form. */
    .bk-dialog {
      border: 0;
      padding: 0;
      margin: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      background: transparent;
      color: #000;
    }
    .bk-dialog[open] {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .bk-dialog::backdrop {
      background: rgba(18, 41, 59, 0.55);
    }

    .bk {
      position: relative;
      width: 100%;
      max-width: 640px;
      max-height: calc(100vh - 48px);
      max-height: calc(100dvh - 48px);
      display: flex;
      flex-direction: column;
      background: #fff;
      color: #000;
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(18, 41, 59, 0.3);
      font-family: var(--font-body);
    }
    .bk-dialog[open] .bk {
      animation: bk-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes bk-in {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
    }

    .bk-head {
      flex: none;
      padding: 26px 28px 18px;
      border-bottom: 1px solid #e8ecef;
    }
    .bk-eyebrow {
      padding-right: 48px;
      line-height: 1.5;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .bk-title {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 28px;
      line-height: 1.15;
      margin: 6px 0 0;
      letter-spacing: -0.01em;
    }
    .bk-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid #dde3e8;
      background: #fff;
      color: var(--oxblood);
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }
    .bk-close:hover {
      border-color: var(--oxblood);
    }

    /* The form sits between .bk and .bk-body, so it passes the height limit
       down; otherwise the body never scrolls and the Submit footer is pushed
       off-screen. */
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
    .bk input[type='text'],
    .bk input[type='tel'],
    .bk input[type='email'],
    .bk input[type='number'] {
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
    .bk input:focus {
      outline: none;
      border-color: var(--highlight-blue);
      box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.2);
    }
    .bk [aria-invalid='true'] {
      border-color: var(--ember-a);
    }
    .bk-error {
      color: #b0301a;
      font-size: 13px;
      margin: 6px 0 0;
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

    .bk .bk-field label.bk-consent {
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
    .bk-btn-primary:hover {
      filter: brightness(1.05);
    }
    .bk-btn:focus-visible,
    .bk-close:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }

    .bk-done {
      text-align: center;
      padding: 18px 6px 6px;
      outline: none;
    }
    .bk-done-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 14px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #e6f7fd;
      color: var(--oxblood);
      font-size: 30px;
    }
    .bk-done h3 {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 26px;
      margin: 0 0 10px;
    }
    .bk-done p {
      margin: 0 auto 8px;
      max-width: 42ch;
      line-height: 1.55;
    }
    .bk-done .bk-price {
      font-family: var(--font-display);
      font-size: 22px;
      margin: 16px 0 4px;
    }
    .bk-price s {
      color: #4a5a66;
      font-size: 16px;
      margin-right: 6px;
    }
    .bk-done .bk-demo {
      margin-top: 14px;
      font-size: 13px;
      color: #4a5a66;
      background: #f3f6f8;
      border-radius: 10px;
      padding: 10px 12px;
    }

    /* Phones: full-screen sheet */
    @media (max-width: 640px) {
      .bk-dialog[open] {
        padding: 0;
        align-items: stretch;
      }
      .bk {
        max-width: none;
        max-height: none;
        height: 100%;
        border-radius: 0;
      }
      .bk-head {
        padding: 20px 18px 14px;
      }
      .bk-title {
        font-size: 24px;
        padding-right: 44px;
      }
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
    @media (prefers-reduced-motion: reduce) {
      .bk-dialog[open] .bk {
        animation: none;
      }
    }
  `,
})
export class BookingForm {
  protected readonly modal = inject(BookingModalService);
  private readonly injector = inject(Injector);

  private readonly dlg = viewChild<ElementRef<HTMLDialogElement>>('dlg');

  protected readonly genders = GENDERS;
  protected readonly form = makeForm();

  protected readonly attempted = signal(false);
  protected readonly submitted = signal(false);
  protected readonly firstName = signal('');
  protected readonly demoNote = signal('');

  constructor() {
    effect(() => {
      const wantOpen = this.modal.isOpen();
      untracked(() => {
        const dialog = this.dlg()?.nativeElement;
        if (!dialog) {
          return;
        }
        if (wantOpen && !dialog.open) {
          this.reset();
          dialog.showModal();
          document.body.style.overflow = 'hidden';
          this.focusFirstField(); // start in the first field, not on the close button
        } else if (!wantOpen && dialog.open) {
          dialog.close();
        }
      });
    });
  }

  /** Fires for every way the dialog closes: the X, Escape, a click outside, or close(). */
  protected onNativeClose(): void {
    document.body.style.removeProperty('overflow');
    this.modal.close();
  }

  /** A click on the dialog itself (not the card inside it) is a click outside the form. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dlg()?.nativeElement) {
      this.modal.close();
    }
  }

  /** True when this field should show its error: it is invalid and was touched, or Submit was already pressed. */
  protected invalid(name: FieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.attempted());
  }

  protected onSubmit(): void {
    if (this.submitted()) {
      this.continueToPayment();
      return;
    }

    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      afterNextRender(() => this.dlg()?.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    this.submit();
  }

  /**
   * DEMO MODE: nothing is sent. When email delivery is wired up (Web3Forms),
   * send this.form.getRawValue() here and only go to the thank-you screen on
   * success, showing an error and keeping the answers if it fails.
   */
  private submit(): void {
    this.firstName.set(this.form.controls.name.value.trim().split(/\s+/)[0] ?? '');
    this.demoNote.set('Demo mode: nothing was sent. On the live site these answers are emailed to you.');
    this.submitted.set(true);
    afterNextRender(() => this.dlg()?.nativeElement.querySelector<HTMLElement>('.bk-done')?.focus({ preventScroll: true }), { injector: this.injector });
  }

  /** DEMO MODE: on the live site this opens the Razorpay payment page for the 2,499 rupee consultation. */
  private continueToPayment(): void {
    this.demoNote.set('Demo mode: on the live site this button opens the ₹2,499 payment page.');
  }

  private focusFirstField(): void {
    afterNextRender(() => this.dlg()?.nativeElement.querySelector<HTMLElement>('.bk-body input')?.focus({ preventScroll: true }), { injector: this.injector });
  }

  private reset(): void {
    this.form.reset();
    this.attempted.set(false);
    this.submitted.set(false);
    this.firstName.set('');
    this.demoNote.set('');
  }
}
