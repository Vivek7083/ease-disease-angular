import { Component, ElementRef, Injector, afterNextRender, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import type { BookingCreated } from '../../../core/api/api-types';
import { AuthService } from '../../../core/services/auth';
import { BookingModalService } from '../../../core/services/booking-modal';
import { PackagesService } from '../../../core/services/packages';
import { DetailsStep } from './details-step';
import { PayStep } from './pay-step';
import { SignInStep } from './sign-in-step';

/**
 * The on-site booking dialog: a pop-up on desktop and a full-screen sheet on phones. It is only the frame (header,
 * close, focus, backdrop) around one of four views: checking the sign-in, the sign-in step, the details step, and the
 * pay step (the booking exists; hand over to PayU). The two steps load on demand, so the Home page does not download the forms up front.
 * The earlier three-step version is kept in docs/reference/booking-form-three-step.ts.txt.
 */
@Component({
  selector: 'app-booking-form',
  imports: [SignInStep, DetailsStep, PayStep],
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
          <div class="bk-eyebrow">{{ eyebrow() }}</div>
          <h2 class="bk-title" id="bk-title">{{ title() }}</h2>
        </div>

        @if (modal.isOpen()) {
          @switch (view()) {
            @case ('sign-in') {
              <!-- Deferred: the step brings Signal Forms with it, which the Home page should not download up front. -->
              @defer {
                <app-sign-in-step [mode]="modal.mode()" />
              } @placeholder {
                <p class="bk-checking" role="status">Loading&hellip;</p>
              }
            }
            @case ('details') {
              @defer {
                <app-details-step (created)="onCreated($event)" />
              } @placeholder {
                <p class="bk-checking" role="status">Loading&hellip;</p>
              }
            }
            @case ('pay') {
              @if (created(); as booking) {
                <app-pay-step [booking]="booking" />
              }
            }
            @default {
              <p class="bk-checking" role="status">Checking your sign-in&hellip;</p>
            }
          }
        }
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

    .bk-close:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }

    .bk-checking {
      margin: 0;
      padding: 28px;
      color: #4a5a66;
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
  private readonly auth = inject(AuthService);
  private readonly plan = inject(PackagesService).plan;
  private readonly injector = inject(Injector);

  private readonly dlg = viewChild<ElementRef<HTMLDialogElement>>('dlg');

  /** The booking just created, once the details step is done. */
  protected readonly created = signal<BookingCreated | null>(null);

  /**
   * What the dialog shows. Booking needs a signed-in person: signed out, it opens on the sign-in step and moves on to
   * the details step by itself once sign-in finishes. The navbar's Log in / Sign up shows only the sign-in step.
   */
  protected readonly view = computed<'checking' | 'sign-in' | 'details' | 'pay'>(() => {
    if (this.created()) {
      return 'pay';
    }
    if (!this.auth.ready()) {
      return 'checking';
    }
    return this.auth.user() ? 'details' : 'sign-in';
  });

  protected readonly eyebrow = computed(() =>
    this.view() === 'sign-in' && this.modal.mode() === 'sign-in'
      ? 'Your Ease Dis-ease account'
      : `The E.A.S.E. Root Cause Assessment \u00b7 ${this.plan().duration}`,
  );

  protected readonly title = computed(() => {
    switch (this.view()) {
      case 'details':
        return 'Tell us a little about you';
      case 'pay':
        return "You're almost booked";
      case 'sign-in':
        return this.modal.mode() === 'sign-in' ? 'Log in or sign up' : 'Sign in to book';
      default:
        return 'One moment';
    }
  });

  constructor() {
    effect(() => {
      const wantOpen = this.modal.isOpen();
      untracked(() => {
        const dialog = this.dlg()?.nativeElement;
        if (!dialog) {
          return;
        }
        if (wantOpen && !dialog.open) {
          this.created.set(null);
          dialog.showModal();
          document.body.style.overflow = 'hidden';
          this.focusFirstField(); // start in the first field, not on the close button
        } else if (!wantOpen && dialog.open) {
          dialog.close();
        }
      });
    });

    // Signed in from the navbar's Log in / Sign up: the job is done, so close the dialog.
    effect(() => {
      if (this.modal.isOpen() && this.modal.mode() === 'sign-in' && this.auth.user()) {
        untracked(() => this.modal.close());
      }
    });

    // The view changed under an open dialog (sign-in finished, the booking was created): put focus in the new view.
    effect(() => {
      this.view();
      untracked(() => {
        if (this.modal.isOpen()) {
          this.focusFirstField();
        }
      });
    });
  }

  protected onCreated(booking: BookingCreated): void {
    this.created.set(booking);
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

  private focusFirstField(): void {
    afterNextRender(
      () => this.dlg()?.nativeElement.querySelector<HTMLElement>('[data-autofocus], .bk-body input, .done')?.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }
}
