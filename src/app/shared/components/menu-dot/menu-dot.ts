import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaPill } from '../cta-pill/cta-pill';
import { Wordmark } from '../wordmark/wordmark';

export interface NavLink {
  readonly label: string;
  readonly route: string;
  readonly fragment?: string;
}

/**
 * The navbar's small-screen menu: a round button with two lines that opens a
 * sheet dropping down from the top edge where the bar is, in the same white. Big
 * tappable rows for the links, the account action, and Book now at the bottom.
 * A native <dialog> (like the booking form), so the browser traps focus,
 * Escape closes it and focus goes back to the button.
 */
@Component({
  selector: 'app-menu-dot',
  imports: [RouterLink, CtaPill, Wordmark],
  template: `
    <button type="button" class="toggle" aria-haspopup="dialog" aria-label="Open menu" (click)="show()">
      <span class="lines" aria-hidden="true"><i></i><i></i></span>
    </button>

    <dialog #dlg class="sheet" aria-label="Site menu" (close)="onClosed()" (click)="onDialogClick($event)">
      <div class="panel">
        <div class="head">
          <app-wordmark [collapse]="false" (click)="hide()" />
          <button type="button" class="close" aria-label="Close menu" (click)="hide()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        <nav class="links" aria-label="Main">
          @for (link of links(); track link.label) {
            <a [routerLink]="link.route" [fragment]="link.fragment" (click)="hide()"><span>{{ link.label }}</span><span class="arrow" aria-hidden="true">&rarr;</span></a>
          }
        </nav>

        <div class="account">
          @if (signedInEmail(); as email) {
            <p class="who">Signed in as <span>{{ email }}</span></p>
            <button type="button" class="account-btn" (click)="signOut.emit(); hide()">Sign out</button>
          } @else {
            <button type="button" class="account-btn" (click)="signIn.emit(); hide()">Log in / Sign up</button>
          }
        </div>

        <app-cta-pill class="book" label="Book now" variant="primary" (pressed)="book.emit(); hide()" />
      </div>
    </dialog>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .toggle {
      width: 40px;
      height: 40px;
      flex: none;
      border: 0;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--surface-glass-light);
      cursor: pointer;
      transition: background var(--dur-micro) var(--ease);
    }
    .toggle:hover {
      background: color-mix(in oklab, var(--oxblood) 12%, transparent);
    }
    .toggle:focus-visible,
    .close:focus-visible,
    .account-btn:focus-visible,
    .links a:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 2px;
    }
    /* Two thin lines, the lower one shorter: quiet and current, not a stack of dots. */
    .lines {
      display: grid;
      gap: 6px;
      justify-items: end;
    }
    .lines i {
      display: block;
      width: 18px;
      height: 1.75px;
      border-radius: 2px;
      background: var(--ink);
    }
    .lines i:last-child {
      width: 12px;
    }

    /* The dialog is a transparent full-screen frame (the dim and blur come from
       its backdrop); the panel inside is the visible sheet, placed where the bar is. */
    .sheet {
      border: 0;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      background: transparent;
      color: var(--ink);
    }
    .sheet::backdrop {
      background: color-mix(in oklab, var(--oxblood-deep) 38%, transparent);
      -webkit-backdrop-filter: blur(6px);
      backdrop-filter: blur(6px);
    }
    .sheet[open] {
      display: block;
      overflow-y: auto;
    }
    .panel {
      box-sizing: border-box;
      margin: 0;
      padding: calc(env(safe-area-inset-top, 0px) + var(--sp-2)) var(--sp-4) var(--sp-5);
      border-radius: 0 0 var(--r-lg) var(--r-lg);
      background: var(--surface-card-light);
      box-shadow: 0 24px 60px -24px color-mix(in oklab, var(--oxblood-deep) 60%, transparent);
      animation: sheet-in var(--dur-base) var(--ease-out-soft) both;
    }
    @keyframes sheet-in {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
      }
    }
    .head {
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 0;
    }
    .close {
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: 50%;
      background: var(--surface-glass-light);
      color: var(--ink);
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    .links {
      margin: var(--sp-3) 0 0;
      display: flex;
      flex-direction: column;
    }
    .links a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 56px;
      border-bottom: 1px solid var(--rule-on-light);
      font-family: var(--font-display);
      font-size: var(--fs-display-s);
      color: var(--ink);
      text-decoration: none;
    }
    .links a:last-child {
      border-bottom: 0;
    }
    .arrow {
      font-family: var(--font-body);
      font-size: 1.1rem;
      color: var(--text-quiet-light);
    }
    .account {
      margin: var(--sp-4) 0 0;
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
    }
    .who {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-quiet-light);
    }
    .who span {
      display: block;
      color: var(--ink);
      overflow-wrap: anywhere;
    }
    .account-btn {
      min-height: var(--tap-min);
      border: 0;
      border-radius: var(--r-pill);
      background: var(--surface-glass-light);
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 500;
      color: var(--ink);
      cursor: pointer;
    }
    /* Book now fills the row so it is the easiest thing to hit with a thumb. */
    .book {
      display: block;
      margin: var(--sp-3) 0 0;
    }
    .book ::ng-deep .cta {
      width: 100%;
      justify-content: center;
    }
    @media (min-width: 641px) {
      .panel {
        padding-inline: var(--sp-6);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .panel {
        animation: none;
      }
    }
  `,
})
export class MenuDot {
  /** The links to list, already filtered for the current page by the navbar. */
  readonly links = input.required<readonly NavLink[]>();
  /** The signed-in email, or null when signed out. */
  readonly signedInEmail = input<string | null>(null);
  readonly signIn = output<void>();
  readonly signOut = output<void>();
  readonly book = output<void>();

  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  protected show(): void {
    this.dlg().nativeElement.showModal();
    document.body.style.overflow = 'hidden';
  }

  protected hide(): void {
    this.dlg().nativeElement.close();
  }

  /** A tap on the dimmed area (the dialog itself, not the panel) closes the sheet. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dlg().nativeElement) {
      this.hide();
    }
  }

  /** Fires for every way the sheet closes: the X, Escape, a tap outside, or a link / button inside it. */
  protected onClosed(): void {
    // Book now closes this sheet and opens the booking dialog in the same
    // tick: leave the scroll lock alone if another dialog has taken over.
    if (!document.querySelector('dialog[open]')) {
      document.body.style.removeProperty('overflow');
    }
  }
}
