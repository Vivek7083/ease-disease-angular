import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { BookingListItem } from '../../core/api/api-types';
import { describeError } from '../../core/api/error-messages';
import { statusLabel, type ListTab } from '../../core/booking/booking-list';
import { formatIst, noticeFor } from '../../core/booking/booking-status';
import { AuthService } from '../../core/services/auth';
import { BookingModalService } from '../../core/services/booking-modal';
import { BookingsService } from '../../core/services/bookings';
import { formatRupees } from '../../core/services/packages';
import { PaymentService } from '../../core/services/payment';
import { ApiError } from '../../core/api/api-error';
import { Countdown } from '../../core/util/countdown';

/** What one tab has loaded so far. */
interface TabState {
  items: BookingListItem[];
  nextCursor: string | null;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

const emptyTab = (): TabState => ({ items: [], nextCursor: null, loaded: false, loading: false, error: null });
const TABS: readonly { id: ListTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'past', label: 'Past' },
];

/**
 * My Bookings: the signed-in person's bookings, newest first, in two tabs (Active, Past) with "Load more". A booking
 * still waiting for payment has a Pay now button; every row opens that booking's page. Signed-out visitors are asked to
 * sign in first and the list loads as soon as they do. The backend can also send people here with an `?e=` flag when it
 * could not tie a payment to a booking (see app.routes.ts: /bookings redirects here).
 */
@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink],
  template: `
    <main class="page">
      <section class="card" aria-labelledby="mb-title">
        <h1 id="mb-title">My bookings</h1>

        @if (notice(); as note) {
          <p class="notice" role="status">{{ note }}</p>
        }

        @if (!auth.ready()) {
          <p class="quiet" role="status">Checking your sign-in&hellip;</p>
        } @else if (!auth.user()) {
          <p>Sign in to see the bookings you have made.</p>
          <button type="button" class="btn" (click)="auth.openSignIn()">Log in / Sign up</button>
        } @else {
          <div class="tabs" role="tablist" aria-label="Booking lists" (keydown)="onTabKey($event)">
            @for (t of tabs; track t.id) {
              <button
                type="button"
                role="tab"
                class="tab"
                [id]="'tab-' + t.id"
                [attr.aria-selected]="tab() === t.id"
                [attr.aria-controls]="'panel-' + t.id"
                [attr.tabindex]="tab() === t.id ? 0 : -1"
                (click)="select(t.id)"
              >
                {{ t.label }}
              </button>
            }
          </div>

          <div role="tabpanel" [id]="'panel-' + tab()" [attr.aria-labelledby]="'tab-' + tab()" tabindex="0">
            @let s = state();
            @if (s.items.length > 0) {
              <ul class="list">
                @for (item of s.items; track item.reference) {
                  <li class="row">
                    <a class="info" [routerLink]="['/booking', item.reference]">
                      <span class="top">
                        <span class="title">{{ item.packageTitle }}</span>
                        <span class="chip" [class]="label(item).tone">{{ label(item).text }}</span>
                      </span>
                      <span class="meta">
                        <span class="mono">{{ item.reference }}</span>
                        <span>{{ ist(item.createdAt) }}</span>
                        <span>{{ money(item.amountPaise) }}</span>
                      </span>
                    </a>
                    @if (item.canPay) {
                      <button type="button" class="btn pay" [disabled]="payingRef() !== null || waitSeconds() > 0" (click)="pay(item.reference)">
                        @if (payingRef() === item.reference) {
                          Taking you to payment&hellip;
                        } @else if (waitSeconds() > 0) {
                          Please wait {{ waitSeconds() }}s
                        } @else {
                          Pay now
                        }
                      </button>
                    }
                    @if (payError(); as failure) {
                      @if (failure.reference === item.reference) {
                        <p class="row-error" role="alert">{{ failure.message }}</p>
                      }
                    }
                  </li>
                }
              </ul>
              @if (s.nextCursor) {
                <button type="button" class="btn btn-quiet more" [disabled]="s.loading" (click)="loadMore()">
                  {{ s.loading ? 'Loading…' : 'Load more' }}
                </button>
              }
            } @else if (s.loading) {
              <p class="quiet" role="status">Loading your bookings&hellip;</p>
            } @else if (s.loaded && !s.error) {
              <div class="empty">
                @if (tab() === 'active') {
                  <h2>No bookings yet</h2>
                  <p>When you book a consultation it will show up here.</p>
                  <button type="button" class="btn" (click)="book()">Book now</button>
                } @else {
                  <h2>Nothing in the past yet</h2>
                  <p>Finished, cancelled and expired bookings are listed here.</p>
                }
              </div>
            }

            @if (s.error; as problem) {
              <p class="error" role="alert">{{ problem }}</p>
              <button type="button" class="btn btn-quiet" (click)="retry()">Try again</button>
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: `
    .page {
      min-height: 100dvh;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: calc(var(--sp-24) + env(safe-area-inset-top, 0px)) var(--sp-4) var(--sp-12);
    }
    .card {
      width: 100%;
      max-width: 720px;
      box-sizing: border-box;
      padding: var(--sp-8) var(--sp-6);
      border-radius: var(--r-lg);
      background: var(--surface-card-light);
      border: 1px solid var(--rule-on-light);
      box-shadow: 0 24px 60px -32px color-mix(in oklab, var(--oxblood-deep) 45%, transparent);
    }
    h1 {
      margin: 0 0 var(--sp-4);
      font-family: var(--font-display);
      font-weight: 400;
      font-size: var(--fs-display-m);
      line-height: 1.1;
      color: var(--ink);
    }
    h2 {
      margin: 0 0 var(--sp-2);
      font-family: var(--font-display);
      font-weight: 400;
      font-size: var(--fs-display-s);
    }
    p {
      margin: 0 0 var(--sp-4);
      line-height: 1.55;
    }
    .quiet {
      color: var(--text-quiet-light);
    }
    .notice {
      padding: 10px 14px;
      border-radius: 10px;
      background: #f3f6f8;
      font-size: 0.9rem;
    }
    .error,
    .row-error {
      color: #b0301a;
      font-size: 0.95rem;
    }
    .tabs {
      display: flex;
      gap: var(--sp-2);
      margin-bottom: var(--sp-4);
      border-bottom: 1px solid var(--rule-on-light);
    }
    .tab {
      min-height: var(--tap-min);
      padding: 0 var(--sp-5);
      border: 0;
      border-bottom: 2px solid transparent;
      background: none;
      font: inherit;
      font-weight: 500;
      color: var(--text-quiet-light);
      cursor: pointer;
    }
    .tab[aria-selected='true'] {
      color: var(--ink);
      border-bottom-color: var(--oxblood);
    }
    .tab:focus-visible,
    .info:focus-visible,
    .btn:focus-visible,
    [role='tabpanel']:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--sp-3);
    }
    .row {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-4);
      border: 1px solid var(--rule-on-light);
      border-radius: var(--r-md);
      background: #fff;
    }
    .info {
      display: grid;
      gap: var(--sp-2);
      min-width: 0;
      color: inherit;
      text-decoration: none;
      border-radius: var(--r-sm);
    }
    .info:hover .title {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--sp-2) var(--sp-3);
    }
    .title {
      font-weight: 600;
    }
    .chip {
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
      background: #f3f6f8;
    }
    .chip.good {
      background: #e6f7fd;
      color: #0b4a63;
    }
    .chip.wait {
      background: #fff4e0;
      color: #7a4a00;
    }
    .chip.bad {
      background: #fdf1ee;
      color: #7a2412;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-1) var(--sp-4);
      font-size: 0.9rem;
      color: var(--text-quiet-light);
    }
    .mono {
      font-family: var(--font-mono);
      letter-spacing: 0.06em;
    }
    .row-error {
      grid-column: 1 / -1;
      margin: 0;
    }
    .empty {
      padding: var(--sp-8) var(--sp-4);
      text-align: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--tap-min);
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
    .more {
      margin: var(--sp-4) auto 0;
      display: flex;
    }
    @media (max-width: 640px) {
      .card {
        padding: var(--sp-6) var(--sp-4);
      }
      .row {
        grid-template-columns: 1fr;
      }
      .pay,
      .empty .btn {
        width: 100%;
      }
    }
  `,
})
export class MyBookings {
  protected readonly auth = inject(AuthService);
  private readonly bookings = inject(BookingsService);
  private readonly payment = inject(PaymentService);
  private readonly modal = inject(BookingModalService);

  /** The `?e=` flag the payment callback may add (verify, busy, server). Only used to pick a notice. */
  readonly e = input<string | undefined>(undefined);

  protected readonly tabs = TABS;
  protected readonly tab = signal<ListTab>('active');
  private readonly states = signal<Record<ListTab, TabState>>({ active: emptyTab(), past: emptyTab() });

  protected readonly payingRef = signal<string | null>(null);
  protected readonly payError = signal<{ reference: string; message: string } | null>(null);
  /** A rate-limit wait after a failed Pay now; every Pay now button waits it out. */
  private readonly wait = new Countdown();
  protected readonly waitSeconds = this.wait.seconds;

  constructor() {
    // Load the first page of the open tab once someone is signed in (and again if they sign back in).
    effect(() => {
      if (this.auth.user()) {
        untracked(() => this.ensureLoaded(this.tab()));
      }
    });
  }

  protected state(): TabState {
    return this.states()[this.tab()];
  }

  protected notice(): string | null {
    return noticeFor(this.e());
  }

  protected label(item: BookingListItem) {
    return statusLabel(item);
  }

  protected money(paise: number): string {
    return formatRupees(paise);
  }

  protected ist(iso: string): string {
    return formatIst(iso);
  }

  protected select(tab: ListTab): void {
    this.tab.set(tab);
    this.ensureLoaded(tab);
  }

  /** Arrow keys move between the tabs, as a tab list should. */
  protected onTabKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    event.preventDefault();
    const next = this.tab() === 'active' ? 'past' : 'active';
    this.select(next);
    queueMicrotask(() => document.getElementById(`tab-${next}`)?.focus());
  }

  protected loadMore(): void {
    const tab = this.tab();
    const cursor = this.states()[tab].nextCursor;
    if (cursor) {
      void this.load(tab, cursor);
    }
  }

  protected retry(): void {
    const tab = this.tab();
    void this.load(tab, this.states()[tab].items.length > 0 ? this.states()[tab].nextCursor : null);
  }

  protected book(): void {
    this.modal.open('book');
  }

  protected async pay(reference: string): Promise<void> {
    this.payingRef.set(reference);
    this.payError.set(null);
    try {
      await this.payment.startPayment(reference);
      // The browser is leaving for PayU.
    } catch (error) {
      this.payError.set({ reference, message: describeError(error) ?? 'Something went wrong. Please try again.' });
      this.payingRef.set(null);
      if (error instanceof ApiError && error.code === 'RATE_LIMITED' && error.retryAfterSeconds) {
        this.wait.start(error.retryAfterSeconds);
      }
    }
  }

  private ensureLoaded(tab: ListTab): void {
    const state = this.states()[tab];
    if (!state.loaded && !state.loading) {
      void this.load(tab, null);
    }
  }

  private patch(tab: ListTab, change: Partial<TabState>): void {
    this.states.update((all) => ({ ...all, [tab]: { ...all[tab], ...change } }));
  }

  /** Loads a page. `cursor` null is the first page (replacing the list); otherwise the next page is added below. */
  private async load(tab: ListTab, cursor: string | null): Promise<void> {
    this.patch(tab, { loading: true, error: null });
    try {
      const page = await firstValueFrom(this.bookings.list(tab, cursor));
      const earlier = cursor ? this.states()[tab].items : [];
      this.patch(tab, { items: [...earlier, ...page.items], nextCursor: page.nextCursor, loaded: true, loading: false });
    } catch (error) {
      this.patch(tab, { loading: false, loaded: true, error: describeError(error) ?? 'Something went wrong. Please try again.' });
    }
  }
}
